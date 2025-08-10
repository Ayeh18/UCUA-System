from fastapi import APIRouter, HTTPException, Body
from config import conn
import bcrypt

router = APIRouter()

# --- Hashing function ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

@router.post("/reset-password")
async def reset_password(
    staff_id: str = Body(...),
    new_password: str = Body(...)
):
    try:
        cur = conn.cursor()

        # Convert staff_id to lowercase
        staff_id_lower = staff_id.lower()

        # Check if user exists (case-insensitive)
        cur.execute("SELECT 1 FROM users WHERE LOWER(staff_id) = %s", (staff_id_lower,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Staff ID not found.")

        # Hash the new password
        hashed_pw = hash_password(new_password)

        # Update password (case-insensitive match)
        cur.execute("UPDATE users SET password = %s WHERE LOWER(staff_id) = %s", (hashed_pw, staff_id_lower))
        conn.commit()

        return {"message": "Password reset successfully."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    finally:
        if cur:
            cur.close()
