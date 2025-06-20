from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_KEY

supabase_client: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Erreur: SUPABASE_URL et SUPABASE_KEY doivent être définis dans le fichier .env")
