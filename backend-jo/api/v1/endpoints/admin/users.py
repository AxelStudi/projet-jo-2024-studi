from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
from api.v1.models.auth_models import User, AdminUserUpdate
from api.v1.dependencies import get_current_admin_user
from core.supabase_client import supabase_client

router = APIRouter()

@router.get("/", response_model=List[User])
def get_all_users(admin: User = Depends(get_current_admin_user)):
    """Récupère la liste de tous les utilisateurs (Admin requis)."""
    response = supabase_client.table('users').select('*').execute()
    return response.data

@router.get("/{user_id}", response_model=User)
def get_user_by_id(user_id: uuid.UUID, admin: User = Depends(get_current_admin_user)):
    """Récupère un utilisateur par son ID (Admin requis)."""
    response = supabase_client.table('users').select('*').eq('id', str(user_id)).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    return response.data

@router.put("/{user_id}", response_model=User)
def update_user_by_admin(user_id: uuid.UUID, user_data: AdminUserUpdate, admin: User = Depends(get_current_admin_user)):
    """Met à jour un utilisateur (Admin requis)."""
    update_dict = user_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour.")
    
    response = supabase_client.table('users').update(update_dict).eq('id', str(user_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    return response.data[0]

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_by_admin(user_id: uuid.UUID, admin: User = Depends(get_current_admin_user)):
    """Supprime un utilisateur (Admin requis)."""
    response = supabase_client.table('users').delete().eq('id', str(user_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    return
