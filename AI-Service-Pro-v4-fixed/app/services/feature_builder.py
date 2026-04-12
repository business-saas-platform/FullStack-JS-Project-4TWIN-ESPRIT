from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class BusinessFrames:
    invoices: pd.DataFrame
    expenses: pd.DataFrame
    clients: pd.DataFrame


class FeatureBuilder:
    def _prepare_invoices(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df
        out = df.copy()
        out['issueDate'] = pd.to_datetime(out['issueDate'], errors='coerce')
        out['dueDate'] = pd.to_datetime(out['dueDate'], errors='coerce')
        out['days_to_due'] = (out['dueDate'] - out['issueDate']).dt.days.fillna(0)
        out['paid_ratio'] = np.where(out['totalAmount'].fillna(0) > 0, out['paidAmount'].fillna(0) / out['totalAmount'].replace(0, np.nan), 0)
        out['paid_ratio'] = out['paid_ratio'].fillna(0).clip(0, 1)
        out['issue_month'] = out['issueDate'].dt.month.fillna(0)
        out['issue_weekday'] = out['issueDate'].dt.weekday.fillna(0)
        out['amount_bucket'] = pd.cut(out['totalAmount'].fillna(0), bins=[-1, 100, 500, 2000, 10000, 10**9], labels=[0, 1, 2, 3, 4]).astype(float)
        return out

    def _prepare_expenses(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df
        out = df.copy()
        out['date'] = pd.to_datetime(out['date'], errors='coerce')
        out['month'] = out['date'].dt.to_period('M').astype(str)
        out['weekday'] = out['date'].dt.weekday.fillna(0)
        out['amount'] = out['amount'].fillna(0)
        return out

    def _prepare_clients(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df
        out = df.copy()
        out['createdAt'] = pd.to_datetime(out['createdAt'], errors='coerce')
        out['lastContactDate'] = pd.to_datetime(out['lastContactDate'], errors='coerce')
        return out

    def prepare(self, frames: BusinessFrames) -> BusinessFrames:
        return BusinessFrames(
            invoices=self._prepare_invoices(frames.invoices),
            expenses=self._prepare_expenses(frames.expenses),
            clients=self._prepare_clients(frames.clients),
        )

    def invoice_training_frame(self, invoices: pd.DataFrame, retail: pd.DataFrame) -> pd.DataFrame:
        inv = self._prepare_invoices(invoices)
        if inv.empty:
            inv = pd.DataFrame(columns=['totalAmount', 'paid_ratio', 'days_to_due', 'issue_month', 'issue_weekday', 'amount_bucket', 'label'])
        else:
            inv['label'] = ((inv['status'] == 'overdue') | ((inv['paidAmount'] < inv['totalAmount']) & inv['status'].isin(['sent', 'viewed']))).astype(int)
            inv = inv[['totalAmount', 'paid_ratio', 'days_to_due', 'issue_month', 'issue_weekday', 'amount_bucket', 'label']]

        if not retail.empty:
            retail_df = retail.copy()
            retail_df = retail_df[retail_df['amount'].fillna(0) > 0]
            synth = pd.DataFrame({
                'totalAmount': retail_df['amount'].fillna(0).clip(lower=0),
                'paid_ratio': np.random.uniform(0.0, 1.0, len(retail_df)),
                'days_to_due': np.random.randint(7, 45, len(retail_df)),
                'issue_month': retail_df['invoice_date'].dt.month.fillna(0),
                'issue_weekday': retail_df['invoice_date'].dt.weekday.fillna(0),
                'amount_bucket': pd.cut(retail_df['amount'].fillna(0), bins=[-1, 100, 500, 2000, 10000, 10**9], labels=[0, 1, 2, 3, 4]).astype(float),
            })
            synth['label'] = ((synth['totalAmount'] > synth['totalAmount'].median()) & (synth['paid_ratio'] < 0.35)).astype(int)
            inv = pd.concat([inv, synth], ignore_index=True)
        return inv.fillna(0)

    def expense_training_frame(self, expenses: pd.DataFrame) -> pd.DataFrame:
        ex = self._prepare_expenses(expenses)
        if ex.empty:
            return pd.DataFrame(columns=['amount', 'weekday', 'relative_to_group'])
        grouped = ex.groupby(['category', 'vendor'], dropna=False)['amount'].transform('mean')
        ex['relative_to_group'] = np.where(grouped > 0, ex['amount'] / grouped, 1.0)
        return ex[['amount', 'weekday', 'relative_to_group']].fillna(0)

    def client_segmentation_frame(self, invoices: pd.DataFrame, clients: pd.DataFrame) -> pd.DataFrame:
        inv = self._prepare_invoices(invoices)
        cls = self._prepare_clients(clients)
        if cls.empty:
            return pd.DataFrame(columns=['clientId', 'recency', 'frequency', 'monetary', 'outstanding'])
        now = pd.Timestamp.utcnow().tz_localize(None)
        if inv.empty:
            seg = cls[['id', 'outstandingBalance', 'totalRevenue']].copy()
            seg['recency'] = 999
            seg['frequency'] = 0
            seg['monetary'] = seg['totalRevenue'].fillna(0)
            seg['outstanding'] = seg['outstandingBalance'].fillna(0)
            return seg.rename(columns={'id': 'clientId'})[['clientId', 'recency', 'frequency', 'monetary', 'outstanding']]
        agg = inv.groupby('clientId').agg(last_invoice=('issueDate', 'max'), frequency=('id', 'count'), monetary=('totalAmount', 'sum')).reset_index()
        agg['recency'] = (now - agg['last_invoice']).dt.days.fillna(999)
        seg = cls.merge(agg[['clientId', 'recency', 'frequency', 'monetary']], left_on='id', right_on='clientId', how='left')
        seg['recency'] = seg['recency'].fillna(999)
        seg['frequency'] = seg['frequency'].fillna(0)
        seg['monetary'] = seg['monetary'].fillna(seg['totalRevenue'].fillna(0))
        seg['outstanding'] = seg['outstandingBalance'].fillna(0)
        return seg.rename(columns={'id': 'clientId'})[['clientId', 'recency', 'frequency', 'monetary', 'outstanding']]

    def cashflow_monthly_frame(self, invoices: pd.DataFrame, expenses: pd.DataFrame) -> pd.DataFrame:
        inv = self._prepare_invoices(invoices)
        ex = self._prepare_expenses(expenses)
        inv_month = pd.DataFrame(columns=['month', 'revenue'])
        ex_month = pd.DataFrame(columns=['month', 'expenses'])
        if not inv.empty:
            inv['month'] = inv['issueDate'].dt.to_period('M').astype(str)
            inv_month = inv.groupby('month', as_index=False)['paidAmount'].sum().rename(columns={'paidAmount': 'revenue'})
        if not ex.empty:
            ex_month = ex.groupby('month', as_index=False)['amount'].sum().rename(columns={'amount': 'expenses'})
        merged = inv_month.merge(ex_month, on='month', how='outer').fillna(0)
        if merged.empty:
            return pd.DataFrame(columns=['month_index', 'revenue', 'expenses', 'net'])
        merged = merged.sort_values('month').reset_index(drop=True)
        merged['month_index'] = range(len(merged))
        merged['net'] = merged['revenue'] - merged['expenses']
        return merged
