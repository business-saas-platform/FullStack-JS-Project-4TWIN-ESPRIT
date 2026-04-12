import uuid
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.domain import AIInsight
from app.schemas.common import InsightOut


class InsightWriter:
    def __init__(self, db: Session):
        self.db = db

    def create(self, insight: InsightOut) -> AIInsight:
        row = AIInsight(
            id=UUID(insight.id) if insight.id else uuid.uuid4(),
            businessId=UUID(insight.businessId),
            type=insight.type,
            category=insight.category,
            title=insight.title,
            description=insight.description,
            confidence=insight.confidence,
            actionable=insight.actionable,
            action=insight.action,
            impact=insight.impact,
            createdAt=insight.createdAt or datetime.now(timezone.utc),
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row
