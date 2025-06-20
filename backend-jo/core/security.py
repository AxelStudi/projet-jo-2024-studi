from fastapi.security import OAuth2PasswordBearer

# Single source of truth for the OAuth2 scheme.
# The tokenUrl points to the login endpoint.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/login")
