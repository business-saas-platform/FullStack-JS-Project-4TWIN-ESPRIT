import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.services.model_registry import ModelRegistry


class ModelTrainer:
    def __init__(self):
        self.registry = ModelRegistry()

    def train_late_payment(self, df: pd.DataFrame) -> str:
        if len(df) < 12:
            padding = pd.DataFrame({
                'totalAmount': np.random.uniform(50, 5000, 64),
                'paid_ratio': np.random.uniform(0, 1, 64),
                'days_to_due': np.random.randint(7, 60, 64),
                'issue_month': np.random.randint(1, 13, 64),
                'issue_weekday': np.random.randint(0, 7, 64),
                'amount_bucket': np.random.randint(0, 5, 64),
                'label': np.random.randint(0, 2, 64),
            })
            df = pd.concat([df, padding], ignore_index=True)
        X = df[['totalAmount', 'paid_ratio', 'days_to_due', 'issue_month', 'issue_weekday', 'amount_bucket']].fillna(0)
        y = df['label'].fillna(0).astype(int)
        model = RandomForestClassifier(n_estimators=220, max_depth=8, random_state=42, class_weight='balanced')
        model.fit(X, y)
        self.registry.save('late_payment_model', {'model': model, 'features': list(X.columns)})
        return 'late_payment_model'

    def train_expense_anomaly(self, df: pd.DataFrame) -> str:
        if len(df) < 10:
            df = pd.DataFrame({
                'amount': np.random.uniform(5, 3000, 120),
                'weekday': np.random.randint(0, 7, 120),
                'relative_to_group': np.random.uniform(0.4, 2.2, 120),
            })
        X = df[['amount', 'weekday', 'relative_to_group']].fillna(0)
        pipe = Pipeline([('scaler', StandardScaler()), ('model', IsolationForest(contamination=0.08, random_state=42))])
        pipe.fit(X)
        self.registry.save('expense_anomaly_model', {'model': pipe, 'features': list(X.columns)})
        return 'expense_anomaly_model'

    def train_client_segmentation(self, df: pd.DataFrame, k: int = 4) -> str:
        if len(df) < max(k, 8):
            df = pd.DataFrame({
                'clientId': [f's{i}' for i in range(20)],
                'recency': np.random.randint(1, 400, 20),
                'frequency': np.random.randint(1, 40, 20),
                'monetary': np.random.uniform(100, 15000, 20),
                'outstanding': np.random.uniform(0, 4000, 20),
            })
        X = df[['recency', 'frequency', 'monetary', 'outstanding']].fillna(0)
        pipe = Pipeline([('scaler', StandardScaler()), ('model', KMeans(n_clusters=min(k, max(2, len(df) // 2)), random_state=42, n_init=10))])
        pipe.fit(X)
        self.registry.save('client_segmentation_model', {'model': pipe, 'features': list(X.columns)})
        return 'client_segmentation_model'

    def train_cashflow_forecast(self, monthly_df: pd.DataFrame) -> str:
        if len(monthly_df) < 4:
            monthly_df = pd.DataFrame({
                'month_index': list(range(12)),
                'revenue': np.random.uniform(1000, 12000, 12),
                'expenses': np.random.uniform(700, 9000, 12),
                'net': np.random.uniform(-1000, 5000, 12),
            })
        X = monthly_df[['month_index', 'revenue', 'expenses']].fillna(0)
        y = monthly_df['net'].fillna(0)
        model = RandomForestRegressor(n_estimators=200, random_state=42, max_depth=8)
        model.fit(X, y)
        self.registry.save('cashflow_forecast_model', {'model': model, 'features': list(X.columns)})
        return 'cashflow_forecast_model'
