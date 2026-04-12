from collections import Counter

import numpy as np
import pandas as pd

from app.services.model_registry import ModelRegistry


class PredictorService:
    def __init__(self):
        self.registry = ModelRegistry()

    def late_payment_scores(self, invoices_df: pd.DataFrame) -> pd.DataFrame:
        payload = self.registry.load('late_payment_model')
        if payload is None or invoices_df.empty:
            return pd.DataFrame(columns=['id', 'risk_score'])
        model = payload['model']
        X = invoices_df[payload['features']].fillna(0)
        probs = model.predict_proba(X)[:, 1] if hasattr(model, 'predict_proba') else model.predict(X)
        out = invoices_df.copy()
        out['risk_score'] = probs
        return out

    def expense_anomalies(self, expenses_df: pd.DataFrame) -> pd.DataFrame:
        payload = self.registry.load('expense_anomaly_model')
        if payload is None or expenses_df.empty:
            return pd.DataFrame(columns=['id', 'anomaly_score', 'is_anomaly'])
        model = payload['model']
        X = expenses_df[payload['features']].fillna(0)
        raw = model.decision_function(X)
        pred = model.predict(X)
        out = expenses_df.copy()
        out['anomaly_score'] = -raw
        out['is_anomaly'] = (pred == -1).astype(int)
        return out

    def segment_clients(self, seg_df: pd.DataFrame):
        payload = self.registry.load('client_segmentation_model')
        if payload is None or seg_df.empty:
            return pd.DataFrame(columns=['clientId', 'segment_label']), {}
        model = payload['model']
        X = seg_df[payload['features']].fillna(0)
        cluster_ids = model.predict(X)
        out = seg_df.copy()
        out['cluster'] = cluster_ids
        labels = {}
        summary = out.groupby('cluster').agg(recency=('recency', 'mean'), frequency=('frequency', 'mean'), monetary=('monetary', 'mean')).reset_index()
        ordered = summary.sort_values(['monetary', 'frequency', 'recency'], ascending=[False, False, True])
        human = ['VIP', 'Loyal', 'Needs Follow-up', 'At Risk', 'Inactive']
        for _, row in ordered.iterrows():
            labels[int(row['cluster'])] = human[min(len(labels), len(human) - 1)]
        out['segment_label'] = out['cluster'].map(labels).fillna('Standard')
        counts = dict(Counter(out['segment_label']))
        return out[['clientId', 'segment_label']], counts

    def forecast_cashflow(self, monthly_df: pd.DataFrame, days: int = 30) -> float:
        payload = self.registry.load('cashflow_forecast_model')
        if payload is None:
            return 0.0
        model = payload['model']
        if monthly_df.empty:
            sample = pd.DataFrame([{'month_index': 0, 'revenue': 0.0, 'expenses': 0.0}])
        else:
            last = monthly_df.iloc[-1]
            month_steps = max(1, int(np.ceil(days / 30)))
            sample = pd.DataFrame([
                {
                    'month_index': int(last['month_index']) + i,
                    'revenue': float(monthly_df['revenue'].tail(min(3, len(monthly_df))).mean()),
                    'expenses': float(monthly_df['expenses'].tail(min(3, len(monthly_df))).mean()),
                }
                for i in range(1, month_steps + 1)
            ])
        pred = model.predict(sample[payload['features']].fillna(0))
        return float(np.sum(pred))
