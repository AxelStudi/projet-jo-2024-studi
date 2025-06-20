from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class OfferCreate(BaseModel):
    name: str
    description: str
    price: float
    type: str
    image_url: Optional[str] = None
    max_attendees: int
    features: Optional[List[str]] = []

class OfferUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    type: Optional[str] = None
    image_url: Optional[str] = None
    max_attendees: Optional[int] = None
    features: Optional[List[str]] = None

class Offer(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    price: float
    type: str
    image_url: Optional[str] = None
    max_attendees: int
    features: Optional[List[str]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
