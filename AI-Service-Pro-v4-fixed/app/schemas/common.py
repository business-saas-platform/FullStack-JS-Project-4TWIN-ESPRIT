from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = 'ok'
    service: str
    time: datetime


class InsightOut(BaseModel):
    id: str | None = None
    businessId: str
    type: Literal['prediction', 'warning', 'recommendation', 'opportunity']
    category: Literal['revenue', 'expenses', 'clients', 'cash_flow', 'invoices']
    title: str
    description: str
    confidence: float = Field(ge=0, le=1)
    actionable: bool = True
    action: str | None = None
    impact: Literal['high', 'medium', 'low'] | None = None
    createdAt: datetime | None = None


class NotificationOut(BaseModel):
    id: str | None = None
    businessId: str
    level: Literal['info', 'warning', 'critical']
    title: str
    message: str
    createdAt: datetime
    channel: Literal['dashboard', 'email', 'dashboard_email'] = 'dashboard'
    sent: bool = False
    read: bool = False
    category: Literal['revenue', 'expenses', 'clients', 'cash_flow', 'invoices', 'system'] = 'system'
    priority: int = Field(default=3, ge=1, le=5)
    actionLabel: str | None = None
    actionUrl: str | None = None
    source: str = 'ai_engine'
    score: float | None = Field(default=None, ge=0, le=1)
    meta: dict[str, Any] = Field(default_factory=dict)


class SummaryOut(BaseModel):
    businessId: str
    businessName: str
    generatedAt: datetime
    totalRevenue: float
    totalExpenses: float
    cashIn: float
    cashOut: float
    outstandingInvoices: int
    overdueInvoices: int
    avgInvoiceAmount: float
    forecast30d: float
    anomalyCount: int
    highRiskInvoices: int
    clientSegments: dict[str, int]
    topRecommendations: list[str]


class CoachAdviceOut(BaseModel):
    id: str
    businessId: str
    title: str
    message: str
    category: Literal['growth', 'risk', 'cashflow', 'clients', 'operations', 'invoices', 'expenses'] = 'operations'
    priority: Literal['low', 'medium', 'high'] = 'medium'
    action: str | None = None
    actionUrl: str | None = None
    score: float | None = Field(default=None, ge=0, le=1)
    createdAt: datetime


class CoachResponse(BaseModel):
    businessId: str
    generatedAt: datetime
    total: int
    highPriority: int
    items: list[CoachAdviceOut]


class TrainResponse(BaseModel):
    success: bool
    message: str
    models: list[str] = Field(default_factory=list)


class RunResponse(BaseModel):
    success: bool
    businessId: str
    createdInsights: int
    notifications: int
    imagePath: str | None = None


class NotificationListResponse(BaseModel):
    businessId: str
    total: int
    unread: int
    items: list[NotificationOut]


class NotificationActionResponse(BaseModel):
    success: bool
    businessId: str
    affected: int = 0
    unread: int = 0
