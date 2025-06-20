from fastapi import APIRouter, Depends, HTTPException
from ..models.auth_models import User, UserUpdate
from ..dependencies import get_current_user
from core.supabase_client import supabase_client
import uuid

router = APIRouter()

@router.get("/profile", response_model=User)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Récupère le profil de l'utilisateur actuellement connecté.
    """
    return current_user

@router.put("/profile", response_model=User)
def update_user_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    """
    Met à jour le profil de l'utilisateur actuellement connecté.
    """
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Le client Supabase n'est pas initialisé.")

    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour.")

    try:
        user_id = current_user['id']
        response = supabase_client.table('users').update(update_data).eq('id', user_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail="Profil utilisateur non trouvé.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Une erreur est survenue: {str(e)}")
