from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.schemas.common import CoachAdviceOut, CoachResponse, InsightOut, RunResponse, SummaryOut
from app.services.feature_builder import BusinessFrames, FeatureBuilder
from app.services.image_generator import BusinessImageGenerator
from app.services.insight_writer import InsightWriter
from app.services.notifier import NotificationCenter
from app.services.predictors import PredictorService
from app.services.repositories import BusinessRepository


class AIEngine:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BusinessRepository(db)
        self.builder = FeatureBuilder()
        self.predictor = PredictorService()
        self.insights = InsightWriter(db)
        self.notifications = NotificationCenter()
        self.image_gen = BusinessImageGenerator()

    def _summary(self, business_id: UUID) -> SummaryOut:
        business = self.repo.get_business(business_id)
        if not business:
            raise ValueError('Business not found')
        raw_frames = BusinessFrames(
            invoices=self.repo.invoices_df(business_id),
            expenses=self.repo.expenses_df(business_id),
            clients=self.repo.clients_df(business_id),
        )
        frames = self.builder.prepare(raw_frames)
        invoice_scoring = self.predictor.late_payment_scores(frames.invoices)
        expense_features = self.builder.expense_training_frame(frames.expenses)
        anomalies = self.predictor.expense_anomalies(expense_features)
        seg_df = self.builder.client_segmentation_frame(frames.invoices, frames.clients)
        _, seg_counts = self.predictor.segment_clients(seg_df)
        monthly = self.builder.cashflow_monthly_frame(frames.invoices, frames.expenses)
        forecast = self.predictor.forecast_cashflow(monthly)

        total_revenue = float(frames.invoices['paidAmount'].sum()) if not frames.invoices.empty else 0.0
        total_expenses = float(frames.expenses['amount'].sum()) if not frames.expenses.empty else 0.0
        outstanding_invoices = int((frames.invoices['status'].isin(['sent', 'viewed', 'overdue'])).sum()) if not frames.invoices.empty else 0
        overdue_invoices = int((frames.invoices['status'] == 'overdue').sum()) if not frames.invoices.empty else 0
        avg_invoice = float(frames.invoices['totalAmount'].mean()) if not frames.invoices.empty else 0.0
        high_risk = int((invoice_scoring['risk_score'] >= 0.7).sum()) if not invoice_scoring.empty else 0
        anomaly_count = int((anomalies['is_anomaly'] == 1).sum()) if not anomalies.empty else 0

        recs = []
        if high_risk > 0:
            recs.append(f'{high_risk} factures présentent un risque élevé de retard de paiement.')
        if anomaly_count > 0:
            recs.append(f'{anomaly_count} dépenses anormales méritent une vérification.')
        if forecast < 0:
            recs.append('Le forecast 30 jours est négatif: réduire les dépenses variables et accélérer les relances.')
        if not recs:
            recs.append('La situation semble stable. Continuer le suivi hebdomadaire AI.')

        return SummaryOut(
            businessId=str(business_id),
            businessName=business.name,
            generatedAt=datetime.now(timezone.utc),
            totalRevenue=round(total_revenue, 2),
            totalExpenses=round(total_expenses, 2),
            cashIn=round(total_revenue, 2),
            cashOut=round(total_expenses, 2),
            outstandingInvoices=outstanding_invoices,
            overdueInvoices=overdue_invoices,
            avgInvoiceAmount=round(avg_invoice, 2),
            forecast30d=round(float(forecast), 2),
            anomalyCount=anomaly_count,
            highRiskInvoices=high_risk,
            clientSegments=seg_counts,
            topRecommendations=recs,
        )

    def _emit_notification(
        self,
        *,
        business_id: UUID,
        level: str,
        title: str,
        message: str,
        category: str,
        priority: int,
        action_label: str,
        action_url: str,
        dedupe_key: str,
        score: float | None = None,
        email_to: str | None = None,
    ) -> bool:
        note = self.notifications.create(
            str(business_id),
            level,
            title,
            message,
            channel='dashboard_email' if email_to else 'dashboard',
            category=category,
            priority=priority,
            action_label=action_label,
            action_url=action_url,
            score=score,
            meta={'dedupeKey': dedupe_key, 'businessId': str(business_id)},
        )
        if email_to and level in {'critical', 'warning'}:
            note.sent = self.notifications.email(email_to, note)
            self.notifications.store(note)
        return True

    def summary(self, business_id: UUID) -> SummaryOut:
        return self._summary(business_id)


    def ai_coach(self, business_id: UUID) -> CoachResponse:
        """Return business coaching recommendations generated from the latest AI summary.

        This endpoint is designed for the new frontend page:
        GET /api/v1/businesses/{business_id}/ai-coach
        """
        summary = self._summary(business_id)
        now = datetime.now(timezone.utc)
        dashboard_base = f'/dashboard'
        items: list[CoachAdviceOut] = []

        expense_ratio = summary.totalExpenses / summary.totalRevenue if summary.totalRevenue > 0 else 0.0
        overdue_ratio = summary.overdueInvoices / max(summary.outstandingInvoices, 1)

        def add(
            *,
            key: str,
            title: str,
            message: str,
            category: str,
            priority: str,
            action: str,
            action_url: str,
            score: float | None = None,
        ):
            items.append(CoachAdviceOut(
                id=f'coach-{key}',
                businessId=str(business_id),
                title=title,
                message=message,
                category=category,
                priority=priority,
                action=action,
                actionUrl=action_url,
                score=score,
                createdAt=now,
            ))

        if summary.overdueInvoices > 0:
            add(
                key='overdue-invoices',
                title='Relancer les factures en retard',
                message=f'{summary.overdueInvoices} facture(s) sont en retard. Priorise les clients avec les plus gros soldes ouverts pour améliorer rapidement le cash flow.',
                category='invoices',
                priority='high',
                action='Voir factures en retard',
                action_url=f'{dashboard_base}/invoices?status=overdue',
                score=min(1.0, overdue_ratio),
            )

        if summary.highRiskInvoices > 0:
            add(
                key='late-risk',
                title='Prévenir les retards de paiement',
                message=f'{summary.highRiskInvoices} facture(s) ont un risque élevé de retard. Envoie une relance préventive avant que le retard arrive.',
                category='risk',
                priority='high',
                action='Analyser le risque',
                action_url=f'{dashboard_base}/invoice-late-risk',
                score=min(1.0, summary.highRiskInvoices / max(summary.outstandingInvoices, 1)),
            )

        if summary.forecast30d < 0:
            add(
                key='negative-cashflow',
                title='Protéger le cash flow 30 jours',
                message=f'La prévision cash flow 30 jours est négative ({summary.forecast30d:.2f}). Réduis les coûts non essentiels et accélère les encaissements.',
                category='cashflow',
                priority='high',
                action='Ouvrir forecast',
                action_url=f'{dashboard_base}/cash-flow-forecast',
                score=1.0,
            )
        elif summary.forecast30d > 0:
            add(
                key='positive-cashflow',
                title='Transformer le cash flow positif en croissance',
                message=f'La prévision 30 jours est positive ({summary.forecast30d:.2f}). Tu peux planifier une action croissance: upsell, campagne client ou investissement contrôlé.',
                category='growth',
                priority='medium',
                action='Voir recommandations AI',
                action_url=f'{dashboard_base}/ai-insights',
                score=0.65,
            )

        if summary.anomalyCount > 0:
            add(
                key='expense-anomalies',
                title='Auditer les dépenses anormales',
                message=f'{summary.anomalyCount} dépense(s) sortent du comportement habituel. Vérifie les justificatifs, fournisseurs et abonnements récurrents.',
                category='expenses',
                priority='medium' if summary.anomalyCount < 3 else 'high',
                action='Voir dépenses',
                action_url=f'{dashboard_base}/expenses?filter=ai-anomaly',
                score=min(1.0, summary.anomalyCount / 10),
            )

        if expense_ratio >= 0.8:
            add(
                key='expense-ratio-high',
                title='Réduire le ratio dépenses/revenus',
                message=f'Les dépenses représentent environ {expense_ratio:.0%} des revenus payés. Identifie les coûts variables à réduire sans impacter les ventes.',
                category='operations',
                priority='high',
                action='Analyser dépenses',
                action_url=f'{dashboard_base}/expenses',
                score=min(1.0, expense_ratio),
            )
        elif summary.totalRevenue > 0:
            add(
                key='margin-control',
                title='Maintenir une marge saine',
                message=f'Le ratio dépenses/revenus est autour de {expense_ratio:.0%}. Continue le suivi hebdomadaire pour éviter une dérive progressive des coûts.',
                category='operations',
                priority='low',
                action='Voir reports',
                action_url=f'{dashboard_base}/reports',
                score=min(1.0, expense_ratio),
            )

        if summary.clientSegments:
            best_segment = max(summary.clientSegments, key=lambda k: summary.clientSegments.get(k, 0))
            add(
                key='client-segment',
                title='Exploiter le meilleur segment client',
                message=f'Le segment client dominant est "{best_segment}". Prépare une offre dédiée ou une relance personnalisée pour augmenter les revenus.',
                category='clients',
                priority='medium',
                action='Voir clients',
                action_url=f'{dashboard_base}/clients',
                score=0.6,
            )

        if not items:
            add(
                key='stable-business',
                title='Situation stable détectée',
                message='Aucune alerte majeure détectée. Continue le suivi AI et prépare une action de croissance légère pour profiter de cette stabilité.',
                category='growth',
                priority='low',
                action='Ouvrir AI Insights',
                action_url=f'{dashboard_base}/ai-insights',
                score=0.5,
            )

        # Highest priority first, then highest score.
        priority_rank = {'high': 0, 'medium': 1, 'low': 2}
        items.sort(key=lambda item: (priority_rank.get(item.priority, 9), -(item.score or 0)))

        return CoachResponse(
            businessId=str(business_id),
            generatedAt=now,
            total=len(items),
            highPriority=sum(1 for item in items if item.priority == 'high'),
            items=items,
        )


    def run_for_business(self, business_id: UUID) -> RunResponse:
        business = self.repo.get_business(business_id)
        if not business:
            raise ValueError('Business not found')

        summary = self._summary(business_id)
        created = 0
        notifications = 0
        email_to = getattr(business, 'email', None)
        dashboard_base = f'/businesses/{business_id}'

        if summary.highRiskInvoices > 0:
            self.insights.create(InsightOut(
                businessId=str(business_id),
                type='warning',
                category='invoices',
                title='High late-payment risk detected',
                description=f'{summary.highRiskInvoices} invoice(s) ont un risque élevé de retard de paiement.',
                confidence=0.85,
                actionable=True,
                action='Prioriser les relances clients à haut risque.',
                impact='high',
            ))
            created += 1
            self._emit_notification(
                business_id=business_id,
                level='warning',
                title='Risque de retard de paiement',
                message=f'{summary.highRiskInvoices} facture(s) ont un score de risque élevé. Lance les relances prioritaires.',
                category='invoices',
                priority=4,
                action_label='Voir les factures à risque',
                action_url=f'{dashboard_base}/invoices?filter=ai-risk',
                dedupe_key=f'{business_id}:late_payment:{summary.highRiskInvoices}',
                score=min(1.0, summary.highRiskInvoices / max(summary.outstandingInvoices, 1)),
                email_to=email_to,
            )
            notifications += 1

        if summary.overdueInvoices > 0:
            self._emit_notification(
                business_id=business_id,
                level='critical' if summary.overdueInvoices >= 3 else 'warning',
                title='Factures en retard',
                message=f'{summary.overdueInvoices} facture(s) sont déjà overdue. Priorité aux clients avec solde ouvert.',
                category='invoices',
                priority=5 if summary.overdueInvoices >= 3 else 4,
                action_label='Relancer maintenant',
                action_url=f'{dashboard_base}/invoices?status=overdue',
                dedupe_key=f'{business_id}:overdue:{summary.overdueInvoices}',
                score=min(1.0, summary.overdueInvoices / max(summary.outstandingInvoices, 1)),
                email_to=email_to,
            )
            notifications += 1

        if summary.anomalyCount > 0:
            self.insights.create(InsightOut(
                businessId=str(business_id),
                type='warning',
                category='expenses',
                title='Expense anomaly detected',
                description=f'{summary.anomalyCount} dépense(s) semblent anormales selon l’historique.',
                confidence=0.78,
                actionable=True,
                action='Vérifier les fournisseurs et les justificatifs concernés.',
                impact='medium',
            ))
            created += 1
            self._emit_notification(
                business_id=business_id,
                level='warning',
                title='Dépenses anormales détectées',
                message=f'{summary.anomalyCount} dépense(s) sortent du comportement habituel. Vérifie les justificatifs.',
                category='expenses',
                priority=4,
                action_label='Auditer les dépenses',
                action_url=f'{dashboard_base}/expenses?filter=ai-anomaly',
                dedupe_key=f'{business_id}:expense_anomaly:{summary.anomalyCount}',
                score=min(1.0, summary.anomalyCount / 10),
                email_to=email_to,
            )
            notifications += 1

        expense_ratio = summary.totalExpenses / summary.totalRevenue if summary.totalRevenue > 0 else 0
        if expense_ratio >= 0.8:
            self._emit_notification(
                business_id=business_id,
                level='warning',
                title='Ratio dépenses/revenus élevé',
                message=f'Les dépenses représentent {expense_ratio:.0%} des revenus payés. Analyse les coûts variables.',
                category='expenses',
                priority=4,
                action_label='Voir le cashflow',
                action_url=f'{dashboard_base}/cashflow',
                dedupe_key=f'{business_id}:expense_ratio:{round(expense_ratio, 2)}',
                score=min(1.0, expense_ratio),
                email_to=email_to,
            )
            notifications += 1

        if summary.forecast30d < 0:
            self.insights.create(InsightOut(
                businessId=str(business_id),
                type='prediction',
                category='cash_flow',
                title='Negative cashflow forecast',
                description=f'Prévision 30 jours: {summary.forecast30d:.2f}. Le cashflow futur est sous pression.',
                confidence=0.72,
                actionable=True,
                action='Réduire les coûts non essentiels et accélérer les encaissements.',
                impact='high',
            ))
            created += 1
            self._emit_notification(
                business_id=business_id,
                level='critical',
                title='Cashflow sous pression',
                message=f'Forecast 30 jours négatif: {summary.forecast30d:.2f}. Il faut accélérer les encaissements.',
                category='cash_flow',
                priority=5,
                action_label='Plan d’action cashflow',
                action_url=f'{dashboard_base}/cashflow?view=forecast',
                dedupe_key=f'{business_id}:cashflow_negative:{round(summary.forecast30d, 2)}',
                score=1.0,
                email_to=email_to,
            )
            notifications += 1
        elif summary.forecast30d > 0 and summary.highRiskInvoices == 0 and summary.anomalyCount == 0:
            self.insights.create(InsightOut(
                businessId=str(business_id),
                type='opportunity',
                category='revenue',
                title='Stable AI business signal',
                description='Le forecast est positif et aucune alerte majeure n’a été détectée.',
                confidence=0.66,
                actionable=True,
                action='Transformer cette stabilité en opportunité commerciale ou investissement.',
                impact='low',
            ))
            created += 1
            self._emit_notification(
                business_id=business_id,
                level='info',
                title='Signal business positif',
                message='Le forecast est positif et aucune alerte majeure n’a été détectée.',
                category='revenue',
                priority=2,
                action_label='Voir les recommandations',
                action_url=f'{dashboard_base}/ai-summary',
                dedupe_key=f'{business_id}:positive_signal:{round(summary.forecast30d, 2)}',
                score=0.65,
            )
            notifications += 1

        self.insights.create(InsightOut(
            businessId=str(business_id),
            type='recommendation',
            category='clients',
            title='AI weekly recommendation',
            description=' | '.join(summary.topRecommendations[:3]),
            confidence=0.69,
            actionable=True,
            action='Consulter le tableau de bord AI et lancer les actions prioritaires.',
            impact='medium',
        ))
        created += 1

        image_path = self.image_gen.create_summary_card(summary)
        return RunResponse(success=True, businessId=str(business_id), createdInsights=created, notifications=notifications, imagePath=image_path)
