from fastapi import APIRouter
from .endpoints import offers, auth, user, reservations, etickets, checkout
from .admin_api import admin_router

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/users", tags=["Users & Authentication"])
api_router.include_router(offers.router, prefix="/offers", tags=["Offers"])
api_router.include_router(user.router, prefix="/users", tags=["Users & Authentication"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["Reservations"])
api_router.include_router(etickets.router, prefix="/etickets", tags=["E-Tickets"])
api_router.include_router(checkout.router, prefix="/checkout", tags=["Checkout"])

# Admin routes
api_router.include_router(admin_router, prefix="/admin", tags=["Administration"])
