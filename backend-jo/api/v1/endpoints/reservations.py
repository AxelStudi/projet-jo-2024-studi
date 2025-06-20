from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..models.ticketing_models import Reservation
from ..models.auth_models import User
from ..dependencies import get_current_user
from core.supabase_client import supabase_client

router = APIRouter()

@router.get("/", response_model=List[Reservation])
def get_user_reservations(current_user: User = Depends(get_current_user)):
    """
    Récupère l'historique des réservations pour l'utilisateur connecté.
    """
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Le client Supabase n'est pas initialisé.")

    user_id = current_user['id']
    try:
        response = supabase_client.table('reservations').select('*, offer:offers(*)').eq('user_id', user_id).order('created_at', desc=True).execute()
        if response.data:
            return response.data
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Une erreur est survenue: {str(e)}")
