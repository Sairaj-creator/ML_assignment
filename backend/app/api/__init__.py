from fastapi import APIRouter
from . import auth, predict, sessions, stats, benchmark

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(predict.router)
api_router.include_router(sessions.router)
api_router.include_router(stats.router)
api_router.include_router(benchmark.router)
