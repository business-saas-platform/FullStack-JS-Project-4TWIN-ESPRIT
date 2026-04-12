from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID as PyUUID

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

AIInsightTypeEnum = PGEnum(
    "prediction", "warning", "recommendation", "opportunity",
    name="ai_insights_type_enum",
    create_type=False,
)
AIInsightCategoryEnum = PGEnum(
    "revenue", "expenses", "clients", "cash_flow", "invoices",
    name="ai_insights_category_enum",
    create_type=False,
)
AIInsightImpactEnum = PGEnum(
    "high", "medium", "low",
    name="ai_insights_impact_enum",
    create_type=False,
)


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    ownerId: Mapped[PyUUID | None] = mapped_column(UUID(as_uuid=True), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    taxId: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    plan: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    currency: Mapped[str | None] = mapped_column(String, nullable=True)
    fiscalYearStart: Mapped[str | None] = mapped_column(String, nullable=True)
    industry: Mapped[str | None] = mapped_column(String, nullable=True)
    taxRate: Mapped[Decimal | float | None] = mapped_column(Numeric, nullable=True)
    isProfileComplete: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    logoUrl: Mapped[str | None] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    businessId: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), index=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    postalCode: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    taxId: Mapped[str | None] = mapped_column(String, nullable=True)
    type: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    totalRevenue: Mapped[float] = mapped_column(Float, default=0)
    outstandingBalance: Mapped[float] = mapped_column(Float, default=0)
    createdAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lastContactDate: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    companyName: Mapped[str | None] = mapped_column(String, nullable=True)
    contactPerson: Mapped[str | None] = mapped_column(String, nullable=True)


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    invoiceNumber: Mapped[str] = mapped_column(String)
    businessId: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), index=True)
    clientId: Mapped[PyUUID | None] = mapped_column(UUID(as_uuid=True), index=True, nullable=True)
    clientName: Mapped[str | None] = mapped_column(String, nullable=True)
    issueDate: Mapped[str | None] = mapped_column(String, nullable=True)
    dueDate: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="draft")
    subtotal: Mapped[float] = mapped_column(Float, default=0)
    taxAmount: Mapped[float] = mapped_column(Float, default=0)
    totalAmount: Mapped[float] = mapped_column(Float, default=0)
    paidAmount: Mapped[float] = mapped_column(Float, default=0)
    currency: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    items: Mapped[list["InvoiceItem"]] = relationship("InvoiceItem", back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    invoice_id: Mapped[PyUUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=True
    )
    description: Mapped[str] = mapped_column(String)
    quantity: Mapped[float] = mapped_column(Float)
    unitPrice: Mapped[float] = mapped_column(Float)
    taxRate: Mapped[float] = mapped_column(Float, default=0)
    amount: Mapped[float] = mapped_column(Float)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    businessId: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), index=True)
    date: Mapped[str | None] = mapped_column(String, nullable=True)
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str | None] = mapped_column(String, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    vendor: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    paymentMethod: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending")
    receiptUrl: Mapped[str | None] = mapped_column(String, nullable=True)
    submittedBy: Mapped[str | None] = mapped_column(String, nullable=True)
    approvedBy: Mapped[str | None] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    businessId: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), index=True)
    type: Mapped[str] = mapped_column(AIInsightTypeEnum)
    category: Mapped[str] = mapped_column(AIInsightCategoryEnum)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float)
    actionable: Mapped[bool] = mapped_column(Boolean, default=True)
    action: Mapped[str | None] = mapped_column(String, nullable=True)
    impact: Mapped[str | None] = mapped_column(AIInsightImpactEnum, nullable=True)
    createdAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


Index("ix_ai_insights_business_created", AIInsight.businessId, AIInsight.createdAt)
