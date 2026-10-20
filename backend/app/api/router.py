from fastapi import APIRouter

from app.api.routes import auth, dashboard, feedback, lookups, reports, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(reports.router)
api_router.include_router(lookups.router)
api_router.include_router(feedback.router)
api_router.include_router(dashboard.router)
