from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.db.session import SessionLocal
from app.services.ai_engine import AIEngine
from app.services.repositories import BusinessRepository

settings = get_settings()
scheduler = BackgroundScheduler(timezone=settings.TIMEZONE)


def scheduled_refresh():
    db = SessionLocal()
    try:
        businesses = BusinessRepository(db).list_businesses()
        for b in businesses:
            try:
                AIEngine(db).run_for_business(b.id)
            except Exception as e:
                print(f"AI error for business {b.id}: {e}")
                continue
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not scheduler.running:
        scheduler.add_job(scheduled_refresh, 'cron', hour='8,14,20', minute=0, id='ai_refresh', replace_existing=True)
        scheduler.start()
    yield
    if scheduler.running:
        scheduler.shutdown(wait=False)


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(router)


@app.get('/')
def root():
    return {'message': 'AI Service running'}
