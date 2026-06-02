from fastapi import APIRouter
from app.api.v1.endpoints import volunteers

router = APIRouter()
router.include_router(volunteers.router)
