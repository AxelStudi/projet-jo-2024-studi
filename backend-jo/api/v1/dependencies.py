from fastapi import Depends, HTTPException, status
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from core.supabase_client import supabase_client
from .models.auth_models import User, TokenData
from core.security import oauth2_scheme

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    
    try:
        user_response = supabase_client.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Enrich user object with data from the 'users' table
        profile_response = supabase_client.table('users').select('*').eq('id', user.id).single().execute()
        
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="User profile not found in database.")

        return User(**profile_response.data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Vérifie si l'utilisateur courant est un administrateur.
    Leve une exception HTTPException 403 si ce n'est pas le cas.
    """
    # FIX: Use attribute access on the Pydantic model
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'utilisateur n'a pas les privilèges suffisants.",
        )
    return current_user
