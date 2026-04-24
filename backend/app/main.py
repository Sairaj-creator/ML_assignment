import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from .config import settings
from .api import api_router
from .database import init_db, SessionLocal
from .core.exceptions import AppException, app_exception_handler
from .core.logging_config import setup_logging
from .middleware.request_id import RequestIDMiddleware
from .middleware.rate_limit import setup_rate_limiting
from .models import User
from .services.auth_service import hash_password

logger = logging.getLogger("uvicorn")

# Track app startup time for uptime_sec in /health (W1 fix)
_START_TIME = time.time()


def ensure_demo_users() -> None:
    """Seed local demo users so a fresh dev database can authenticate immediately."""
    if not settings.DEBUG:
        return

    db = SessionLocal()
    try:
        demo_users = [
            ("demo@edgeai.com", "Demo User", "user"),
            ("admin@edgeai.com", "Admin User", "admin"),
        ]
        created_any = False
        for email, full_name, role in demo_users:
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                existing.full_name = full_name
                existing.role = role
                existing.hashed_password = hash_password("local-demo-only")
                created_any = True
                continue
            db.add(
                User(
                    email=email,
                    hashed_password=hash_password("local-demo-only"),
                    full_name=full_name,
                    role=role,
                )
            )
            created_any = True
        if created_any:
            db.commit()
            logger.info("Seeded local demo users")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()
    ensure_demo_users()
    # C8 FIX: wire preload_all() — gracefully warns on missing ONNX files
    from app.ml.registry import preload_all
    try:
        preload_all()
        logger.info("All model variants loaded (or mock mode active)")
    except Exception as e:
        logger.warning(f"Model preload warning: {e}")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    # Suppress internal detail from validation errors reaching the client
    openapi_url="/openapi.json",
)

# C5 FIX: allow_credentials=True is incompatible with allow_origins=["*"].
# Use explicit origins. Override ALLOWED_ORIGINS in .env for production.
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev
    "http://localhost:3000",   # CRA/Next dev
    "https://*.vercel.app",    # Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestIDMiddleware)

setup_rate_limiting(app)
app.add_exception_handler(AppException, app_exception_handler)

# S1 FIX: expose /metrics for Prometheus/Grafana
Instrumentator().instrument(app).expose(app)

app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["Health"])
def health_check():
    from app.ml.registry import _MODELS, VARIANT_PATHS
    loaded_variants = list(_MODELS.keys())
    model_loaded = settings.MOCK_INFERENCE or len(loaded_variants) > 0
    return {
        "status": "healthy",
        "mock_inference": settings.MOCK_INFERENCE,
        "model_loaded": model_loaded,
        "loaded_variants": loaded_variants if not settings.MOCK_INFERENCE else "mock",
        "model_variant_default": settings.MODEL_VARIANT_DEFAULT,
        "version": settings.VERSION,
        "uptime_sec": round(time.time() - _START_TIME, 1),
    }
