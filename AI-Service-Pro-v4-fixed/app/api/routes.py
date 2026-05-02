from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.common import (
    CoachResponse,
    HealthResponse,
    NotificationActionResponse,
    NotificationListResponse,
    RunResponse,
    SummaryOut,
    TrainResponse,
)
from app.services.ai_engine import AIEngine
from app.services.notifier import NotificationCenter
from app.services.training_orchestrator import TrainingOrchestrator

router = APIRouter(prefix='/api/v1', tags=['ai'])
settings = get_settings()


@router.get('/health', response_model=HealthResponse, tags=['health'])
def health():
    return HealthResponse(service=settings.APP_NAME, time=datetime.now(timezone.utc))


@router.post('/train/all', response_model=TrainResponse)
def train_all(db: Session = Depends(get_db)):
    models = TrainingOrchestrator(db).train_all()
    return TrainResponse(success=True, message='Training completed successfully.', models=models)


@router.post('/businesses/{business_id}/run', response_model=RunResponse)
def run_for_business(business_id: UUID, db: Session = Depends(get_db)):
    try:
        return AIEngine(db).run_for_business(business_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get('/businesses/{business_id}/summary', response_model=SummaryOut)
def business_summary(business_id: UUID, db: Session = Depends(get_db)):
    try:
        return AIEngine(db).summary(business_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc




@router.get('/businesses/{business_id}/ai-coach', response_model=CoachResponse)
def business_ai_coach(business_id: UUID, db: Session = Depends(get_db)):
    try:
        return AIEngine(db).ai_coach(business_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@router.get('/businesses/{business_id}/notifications', response_model=NotificationListResponse)
def business_notifications(
    business_id: UUID,
    include_read: bool = Query(True, description='Set false to return only unread notifications.'),
    limit: int = Query(50, ge=1, le=200),
):
    return NotificationCenter().list_response(str(business_id), include_read=include_read, limit=limit)


@router.get('/businesses/{business_id}/notifications/unread-count')
def business_notifications_unread_count(business_id: UUID):
    center = NotificationCenter()
    return {'businessId': str(business_id), 'unread': center.unread_count(str(business_id))}


@router.patch('/businesses/{business_id}/notifications/{notification_id}/read', response_model=NotificationActionResponse)
def mark_business_notification_read(business_id: UUID, notification_id: str):
    center = NotificationCenter()
    affected = center.mark_read(str(business_id), notification_id)
    return NotificationActionResponse(
        success=affected > 0,
        businessId=str(business_id),
        affected=affected,
        unread=center.unread_count(str(business_id)),
    )


@router.patch('/businesses/{business_id}/notifications/read-all', response_model=NotificationActionResponse)
def mark_all_business_notifications_read(business_id: UUID):
    center = NotificationCenter()
    affected = center.mark_read(str(business_id))
    return NotificationActionResponse(success=True, businessId=str(business_id), affected=affected, unread=0)


@router.delete('/businesses/{business_id}/notifications/{notification_id}', response_model=NotificationActionResponse)
def delete_business_notification(business_id: UUID, notification_id: str):
    center = NotificationCenter()
    affected = center.delete(str(business_id), notification_id)
    return NotificationActionResponse(
        success=affected > 0,
        businessId=str(business_id),
        affected=affected,
        unread=center.unread_count(str(business_id)),
    )


@router.delete('/businesses/{business_id}/notifications', response_model=NotificationActionResponse)
def clear_business_notifications(
    business_id: UUID,
    only_read: bool = Query(False, description='Set true to clear only read notifications.'),
):
    center = NotificationCenter()
    affected = center.clear(str(business_id), only_read=only_read)
    return NotificationActionResponse(
        success=True,
        businessId=str(business_id),
        affected=affected,
        unread=center.unread_count(str(business_id)),
    )


@router.post('/businesses/{business_id}/images/report-card')
def create_report_card(business_id: UUID, db: Session = Depends(get_db)):
    try:
        engine = AIEngine(db)
        summary = engine.summary(business_id)
        return {'success': True, 'path': engine.image_gen.create_summary_card(summary)}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
