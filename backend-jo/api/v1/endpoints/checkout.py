from fastapi import APIRouter, Depends, HTTPException
from typing import List
import uuid
import logging

from ..models.ticketing_models import CheckoutRequest, Reservation
from ..models.auth_models import User
from ..dependencies import get_current_user
from core.supabase_client import supabase_client
from core.security import oauth2_scheme

router = APIRouter()

@router.post("/", response_model=List[Reservation], status_code=201)
def process_checkout(checkout_request: CheckoutRequest, current_user: User = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    """
    Gère le processus de paiement de manière atomique.
    Crée la transaction, la réservation et les e-billets.
    """
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Le client Supabase n'est pas initialisé.")

    # Crée une instance de client authentifiée pour cette requête spécifique.
    # C'est cette instance qui doit être utilisée pour toutes les opérations d'écriture.
    authenticated_client = supabase_client.postgrest.auth(token)

    user_id = current_user.id

    try:
        # 1. Valider les offres et calculer le montant total
        offer_ids = [item.offer_id for item in checkout_request.items]
        offers_response = supabase_client.table('offers').select('id, price').in_('id', offer_ids).execute()
        
        if len(offers_response.data) != len(offer_ids):
            raise HTTPException(status_code=404, detail="Une ou plusieurs offres sont invalides.")

        offers_map = {str(offer['id']): offer['price'] for offer in offers_response.data}
        total_amount = sum(offers_map[str(item.offer_id)] * item.quantity for item in checkout_request.items)

        # 2. Créer la transaction avec le client authentifié
        # 2. Créer la transaction avec le client authentifié (en s'assurant que les UUID et Decimal sont sérialisables)
        transaction_data = {
            'user_id': str(user_id), 
            'amount': float(total_amount), 
            'status': 'completed',
            'transaction_key': str(uuid.uuid4()),
            'payment_method': 'card' # Ajout d'une valeur par défaut
        }
        transaction_response = authenticated_client.table('transactions').insert(transaction_data).execute()
        transaction_id = transaction_response.data[0]['id']

        # 3. Créer les réservations avec le client authentifié
        reservations_to_create = [
            {
                'user_id': str(user_id),
                'offer_id': str(item.offer_id),
                'quantity': item.quantity,
                'transaction_id': str(transaction_id) # str() pour la sécurité, bien que déjà une chaîne
            }
            for item in checkout_request.items
        ]
        reservations_response = authenticated_client.table('reservations').insert(reservations_to_create).execute()
        created_reservations = reservations_response.data

        # 4. Créer les e-billets pour chaque réservation avec le client authentifié
        e_tickets_to_create = []
        for reservation in created_reservations:
            # Trouver la quantité correspondante dans la requête initiale
            quantity = next((item.quantity for item in checkout_request.items if str(item.offer_id) == str(reservation['offer_id'])), 0)
            for _ in range(quantity):
                e_tickets_to_create.append({
                    'reservation_id': reservation['id'],
                    'qr_code_url': f"https://api.qrserver.com/v1/create-qr-code/?data={uuid.uuid4()}&size=100x100"
                })
        if e_tickets_to_create:
            authenticated_client.table('e_tickets').insert(e_tickets_to_create).execute()

        # Convertir les UUID en chaînes pour la sérialisation JSON
        for r in created_reservations:
            for key, value in r.items():
                if isinstance(value, uuid.UUID):
                    r[key] = str(value)

        return created_reservations

    except Exception as e:
        # Pas besoin de logger l'exception en détail ici, FastAPI le fait déjà.
        # logging.exception("Erreur détaillée lors du processus de paiement :")
        # Idéalement, une vraie transaction de base de données (RPC) gérerait le rollback.
        raise HTTPException(status_code=500, detail=f"Le processus de paiement a échoué: {str(e)}")
