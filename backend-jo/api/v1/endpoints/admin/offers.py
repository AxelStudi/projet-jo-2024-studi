from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
from api.v1.models.offer_models import Offer, OfferCreate, OfferUpdate
from api.v1.models.auth_models import User
from api.v1.dependencies import get_current_admin_user
from core.supabase_client import supabase_client

router = APIRouter()

@router.post("/", response_model=Offer, status_code=status.HTTP_201_CREATED)
def create_offer(offer_data: OfferCreate, admin: User = Depends(get_current_admin_user)):
    """Crée une nouvelle offre (Admin requis)."""
    response = supabase_client.table('offers').insert(offer_data.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Erreur lors de la création de l'offre.")
    return response.data[0]

@router.put("/{offer_id}", response_model=Offer)
def update_offer(offer_id: uuid.UUID, offer_data: OfferUpdate, admin: User = Depends(get_current_admin_user)):
    """Met à jour une offre existante (Admin requis)."""
    update_dict = offer_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour.")
    response = supabase_client.table('offers').update(update_dict).eq('id', str(offer_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Offre non trouvée.")
    return response.data[0]

@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer(offer_id: uuid.UUID, admin: User = Depends(get_current_admin_user)):
    """Supprime une offre (Admin requis)."""
    response = supabase_client.table('offers').delete().eq('id', str(offer_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Offre non trouvée.")
    return
