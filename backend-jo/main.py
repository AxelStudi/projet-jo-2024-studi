from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.api import api_router as api_router_v1

app = FastAPI(
    title="Paris JO 2024 API",
    description="API pour la gestion des billets des Jeux Olympiques de Paris 2024",
    version="1.0.0"
)

# Configuration CORS
origins = [
    "http://localhost:8080",  # Port du client React en développement
    "http://localhost:5173",  # Au cas où vous changeriez
    "https://projet-jo-2024.netlify.app", # URL du frontend déployé
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Endpoint racine qui retourne un message de bienvenue.
    """
    return {"message": "Bienvenue sur l'API des JO 2024"}

# Inclure le routeur de l'API v1
app.include_router(api_router_v1, prefix="/api/v1")
