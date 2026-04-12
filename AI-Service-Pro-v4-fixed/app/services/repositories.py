from __future__ import annotations

from uuid import UUID

import pandas as pd
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.domain import AIInsight, Business, Client, Expense, Invoice


class BusinessRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_business(self, business_id: UUID) -> Business | None:
        return self.db.get(Business, business_id)

    def list_businesses(self) -> list[Business]:
        return list(self.db.scalars(select(Business)).all())

    def invoices_df(self, business_id: UUID) -> pd.DataFrame:
        rows = self.db.scalars(select(Invoice).where(Invoice.businessId == business_id)).all()
        return pd.DataFrame([
            {
                'id': str(r.id) if r.id else None,
                'invoiceNumber': r.invoiceNumber,
                'businessId': str(r.businessId) if r.businessId else None,
                'clientId': str(r.clientId) if r.clientId else None,
                'clientName': r.clientName,
                'issueDate': r.issueDate,
                'dueDate': r.dueDate,
                'status': r.status,
                'subtotal': float(r.subtotal or 0),
                'taxAmount': float(r.taxAmount or 0),
                'totalAmount': float(r.totalAmount or 0),
                'paidAmount': float(r.paidAmount or 0),
                'currency': r.currency,
                'notes': r.notes,
            }
            for r in rows
        ])

    def expenses_df(self, business_id: UUID) -> pd.DataFrame:
        rows = self.db.scalars(select(Expense).where(Expense.businessId == business_id)).all()
        return pd.DataFrame([
            {
                'id': str(r.id) if r.id else None,
                'businessId': str(r.businessId) if r.businessId else None,
                'date': r.date,
                'amount': float(r.amount or 0),
                'currency': r.currency,
                'category': r.category,
                'vendor': r.vendor,
                'description': r.description,
                'paymentMethod': r.paymentMethod,
                'status': r.status,
                'submittedBy': r.submittedBy,
                'createdAt': r.createdAt,
            }
            for r in rows
        ])

    def clients_df(self, business_id: UUID) -> pd.DataFrame:
        rows = self.db.scalars(select(Client).where(Client.businessId == business_id)).all()
        return pd.DataFrame([
            {
                'id': str(r.id) if r.id else None,
                'businessId': str(r.businessId) if r.businessId else None,
                'name': r.name,
                'email': r.email,
                'type': r.type,
                'status': r.status,
                'totalRevenue': float(r.totalRevenue or 0),
                'outstandingBalance': float(r.outstandingBalance or 0),
                'lastContactDate': r.lastContactDate,
                'createdAt': r.createdAt,
                'country': r.country,
                'city': r.city,
            }
            for r in rows
        ])

    def latest_insights(self, business_id: UUID, limit: int = 20) -> list[AIInsight]:
        stmt = select(AIInsight).where(AIInsight.businessId == business_id).order_by(desc(AIInsight.createdAt)).limit(limit)
        return list(self.db.scalars(stmt).all())
