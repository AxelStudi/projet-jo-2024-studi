from fastapi import APIRouter
from .endpoints.admin import offers as admin_offers
from .endpoints.admin import users as admin_users

admin_router = APIRouter()

admin_router.include_router(admin_offers.router, prefix="/offers", tags=["Admin - Offers"])
admin_router.include_router(admin_users.router, prefix="/users", tags=["Admin - Users"])
