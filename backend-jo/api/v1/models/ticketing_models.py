from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime
from .offer_models import Offer

class CheckoutItem(BaseModel):
    offer_id: uuid.UUID
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]

class Reservation(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    offer_id: uuid.UUID
    quantity: int
    transaction_id: uuid.UUID
    created_at: datetime
    offer: Optional[Offer] = None

    class Config:
        from_attributes = True

class ETicket(BaseModel):
    id: uuid.UUID
    reservation_id: uuid.UUID
    qr_code_url: str
    is_used: bool
    used_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
