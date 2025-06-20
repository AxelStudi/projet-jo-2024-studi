from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from ..models.auth_models import UserCreate, UserLogin, User, Token, LoginResponse
from core.supabase_client import supabase_client
from ..dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate):
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    
    try:
        # Créer l'utilisateur dans Supabase Auth
        auth_response = supabase_client.auth.sign_up({
            "email": user_in.email,
            "password": user_in.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Could not register user")

        # Ajouter les informations supplémentaires dans la table 'users'
        profile_data = {
            "id": auth_response.user.id,
            "user_key": auth_response.user.id,
            "email": user_in.email,
            "first_name": user_in.first_name,
            "last_name": user_in.last_name
        }
        profile_response = supabase_client.table('users').insert(profile_data).execute()

        if not profile_response.data:
             raise HTTPException(status_code=500, detail="Could not create user profile")

        return profile_response.data[0]

    except Exception as e:
        # Simplification de la gestion d'erreur pour l'exemple
        # Dans un cas réel, il faudrait gérer les différents types d'erreurs (ex: email déjà pris)
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=LoginResponse)
def login_for_access_token(form_data: UserLogin):
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    
    try:
        # 1. Authentifier l'utilisateur avec Supabase
        auth_response = supabase_client.auth.sign_in_with_password({
            "email": form_data.email, # On revient à 'email' car on utilise le modèle UserLogin
            "password": form_data.password
        })
        
        if not auth_response.session or not auth_response.user:
            raise HTTPException(status_code=401, detail="Incorrect email or password")

        # 2. Récupérer le profil de l'utilisateur depuis la table 'users'
        user_id = auth_response.user.id
        profile_response = supabase_client.table('users').select("*").eq('id', user_id).single().execute()

        if not profile_response.data:
            raise HTTPException(status_code=404, detail="User profile not found.")

        # 3. Construire et retourner la réponse complète
        return {
            "access_token": auth_response.session.access_token,
            "user_profile": profile_response.data
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {e}")

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
