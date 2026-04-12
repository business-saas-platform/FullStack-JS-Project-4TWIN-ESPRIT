from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.schemas.common import InsightOut, RunResponse, SummaryOut
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

    def summary(self, business_id: UUID) -> SummaryOut:
        return self._summary(business_id)

    def run_for_business(self, business_id: UUID) -> RunResponse:
        summary = self._summary(business_id)
        created = 0
        notifications = 0

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
            self.notifications.create(str(business_id), 'warning', 'Late payment risk', f'{summary.highRiskInvoices} facture(s) à risque élevé.')
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
            self.notifications.create(str(business_id), 'warning', 'Expense anomaly', f'{summary.anomalyCount} dépense(s) anormales détectées.')
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
            self.notifications.create(str(business_id), 'critical', 'Cashflow under pressure', f'Forecast 30 jours négatif: {summary.forecast30d:.2f}.')
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
