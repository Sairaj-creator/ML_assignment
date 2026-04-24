from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# C1 FIX: engine and SessionLocal are singletons — created once at module load,
# not per-request. Creating them inside get_db() would open a new connection pool
# entry on every request and exhaust Postgres within minutes.
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a scoped DB session and closes it on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_new_db():
    """Used by BackgroundTasks that run after the request session is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models before create_all so SQLAlchemy metadata is populated.
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
