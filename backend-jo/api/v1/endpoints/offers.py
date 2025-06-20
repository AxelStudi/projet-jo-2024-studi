from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from core.supabase_client import supabase_client
from ..models.offer_models import Offer

router = APIRouter()

@router.get("/", response_model=List[Offer])
def get_offers():
    """
    Récupère la liste de toutes les offres depuis la base de données Supabase.
    """
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Le client Supabase n'est pas initialisé.")
    
    try:
        response = supabase_client.table('offers').select("*").execute()
        if response.data:
            return response.data
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Une erreur est survenue: {str(e)}")

@router.get("/{offer_id}", response_model=Offer)
def get_offer_by_id(offer_id: uuid.UUID):
    """
    Récupère une offre spécifique par son ID.
    """
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Le client Supabase n'est pas initialisé.")
    
    try:
        response = supabase_client.table('offers').select("*").eq('id', str(offer_id)).single().execute()
        if response.data:
            return response.data
        raise HTTPException(status_code=404, detail="Offre non trouvée.")
    except Exception as e:
        # Gérer le cas où .single() ne trouve rien, ce qui peut lever une erreur
        if "PGRST116" in str(e): # Code d'erreur PostgREST pour "exact-one row expected"
            raise HTTPException(status_code=404, detail="Offre non trouvée.")
        raise HTTPException(status_code=500, detail=f"Une erreur est survenue: {str(e)}")
