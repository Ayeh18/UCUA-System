from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import conn  # psycopg2 connection
import bcrypt

router = APIRouter()

# --- Input schema ---
class UserRegister(BaseModel):
    staffID: str
    password: str
    name: str
    designation: str
    department: str
    deptQHSE: str
    phone: str
    email: str | None = None

# --- Helper function ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

@router.post("/register")
def register_user(user: UserRegister):
    try:
        cur = conn.cursor()

        # Check for existing user
        cur.execute("SELECT 1 FROM users WHERE staff_id = %s", (user.staffID,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="User already registered.")

        # Determine user_type
        user_type = "admin" if user.department.strip().lower() == "qhse" else "user"

        # Hash the password
        hashed_pw = hash_password(user.password)

        # Insert the user
        cur.execute("""
            INSERT INTO users (
                staff_id, password, name, designation,
                department, dept_qhse, phone_number, email, user_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user.staffID,
            hashed_pw,
            user.name,
            user.designation,
            user.department,
            user.deptQHSE,
            user.phone,
            user.email,
            user_type
        ))

        conn.commit()
        return {"message": "User registered successfully."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    finally:
        if cur:
            cur.close()
