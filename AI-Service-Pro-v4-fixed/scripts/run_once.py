from app.db.session import SessionLocal
from app.services.ai_engine import AIEngine
from app.services.repositories import BusinessRepository


def main():
    db = SessionLocal()
    try:
        for b in BusinessRepository(db).list_businesses():
            print(AIEngine(db).run_for_business(b.id))
    finally:
        db.close()


if __name__ == '__main__':
    main()
