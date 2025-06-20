from fastapi import APIRouter, Depends, HTTPException
import uuid
from ..models.ticketing_models import ETicket
from ..models.auth_models import User
from ..dependencies import get_current_user
from core.supabase_client import supabase_client

router = APIRouter()

@router.get("/{ticket_id}", response_model=ETicket)
def get_eticket_details(ticket_id: uuid.UUID, current_user: User = Depends(get_current_user)):
    """
    Récupère les détails d'un e-ticket spécifique, en vérifiant que l'utilisateur en est le propriétaire.
    """
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Le client Supabase n'est pas initialisé.")

    user_id = current_user['id']
    try:
        # Fetch the ticket and its reservation details to check for ownership
        response = supabase_client.table('e_tickets').select('*, reservation:reservations(user_id)').eq('id', str(ticket_id)).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Billet non trouvé.")

        # Check ownership
        if response.data.get('reservation') and response.data['reservation'].get('user_id') == user_id:
            del response.data['reservation']
            return response.data
        else:
            raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à voir ce billet.")

    except Exception as e:
        if "PGRST116" in str(e): # Not found
            raise HTTPException(status_code=404, detail="Billet non trouvé.")
        raise HTTPException(status_code=500, detail=f"Une erreur est survenue: {str(e)}")
