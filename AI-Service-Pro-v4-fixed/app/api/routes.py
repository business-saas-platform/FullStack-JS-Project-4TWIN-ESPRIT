from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.common import HealthResponse, RunResponse, SummaryOut, TrainResponse
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


@router.get('/businesses/{business_id}/notifications')
def business_notifications(business_id: UUID):
    return NotificationCenter().load(str(business_id))


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
