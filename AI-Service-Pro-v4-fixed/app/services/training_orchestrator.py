import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.feature_builder import FeatureBuilder
from app.services.repositories import BusinessRepository
from app.services.retail_loader import RetailDatasetLoader
from app.services.trainers import ModelTrainer


class TrainingOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BusinessRepository(db)
        self.settings = get_settings()
        self.builder = FeatureBuilder()
        self.loader = RetailDatasetLoader(self.settings.RETAIL_DATASET_PATH)
        self.trainer = ModelTrainer()

    def train_all(self):
        retail = self.loader.load()
        businesses = self.repo.list_businesses()

        all_invoices = []
        all_expenses = []
        all_clients = []
        for b in businesses:
            all_invoices.append(self.repo.invoices_df(b.id))
            all_expenses.append(self.repo.expenses_df(b.id))
            all_clients.append(self.repo.clients_df(b.id))

        invoices = pd.concat(all_invoices, ignore_index=True) if all_invoices else pd.DataFrame()
        expenses = pd.concat(all_expenses, ignore_index=True) if all_expenses else pd.DataFrame()
        clients = pd.concat(all_clients, ignore_index=True) if all_clients else pd.DataFrame()

        invoice_train = self.builder.invoice_training_frame(invoices, retail)
        expense_train = self.builder.expense_training_frame(expenses)
        client_train = self.builder.client_segmentation_frame(invoices, clients)
        cashflow_train = self.builder.cashflow_monthly_frame(invoices, expenses)

        return [
            self.trainer.train_late_payment(invoice_train),
            self.trainer.train_expense_anomaly(expense_train),
            self.trainer.train_client_segmentation(client_train, self.settings.SEGMENTS_K),
            self.trainer.train_cashflow_forecast(cashflow_train),
        ]
