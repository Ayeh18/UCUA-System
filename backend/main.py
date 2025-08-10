from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from fastapi.staticfiles import StaticFiles
import os

# Routers
from form_staff import router as form_staff_router
from form_visitor import router as form_visitor_router
from locations import router as locations_router
from feedback import router as feedback_router
from dashboard import router as dashboard_router
from profile import router as profile_router
from edit_profile import router as edit_profile_router
from register_user import router as register_router
from reset_password import router as reset_password_router
from company import router as company_routes

# Shared config and DB connection
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, conn

# FASTAPI APP INITIALIZATION
app = FastAPI()

# CORS SETTINGS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads folder exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Serve static files from uploads directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ROUTERS
app.include_router(form_staff_router)
app.include_router(form_visitor_router)
app.include_router(locations_router)
app.include_router(feedback_router)
app.include_router(dashboard_router)
app.include_router(profile_router)
app.include_router(edit_profile_router)
app.include_router(register_router)
app.include_router(reset_password_router)
app.include_router(company_routes)

# MODELS
class LoginRequest(BaseModel):
    staff_id: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# JWT CREATION
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# LOGIN ENDPOINT
@app.post("/login", response_model=TokenResponse)
def login_user(request: LoginRequest):
    cur = conn.cursor()
    try:
        cur.execute("SELECT staff_id, password FROM users WHERE LOWER(staff_id) = LOWER(%s)", (request.staff_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid staff ID or password")

        db_staff_id, hashed_password = row
        if not bcrypt.checkpw(request.password.encode('utf-8'), hashed_password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid staff ID or password")

        access_token = create_access_token(
            data={"sub": db_staff_id},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}

    finally:
        cur.close()

# Optional: Root test endpoint
@app.get("/")
def root():
    return {"message": "API is running"}
