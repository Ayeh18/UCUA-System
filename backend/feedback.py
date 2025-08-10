from fastapi import APIRouter, Form, Depends, HTTPException, Header
from typing import Optional
from datetime import datetime, timezone as dt_timezone
from jose import jwt, JWTError, ExpiredSignatureError
from pytz import timezone
import logging

from config import conn, SECRET_KEY, ALGORITHM

router = APIRouter()
logging.basicConfig(level=logging.INFO)

# --- Authentication helper ---
def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        logging.warning("Authorization header missing")
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            logging.warning("Invalid authentication scheme")
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id = payload.get("sub")
        if not staff_id:
            logging.warning("Token missing 'sub' claim")
            raise HTTPException(status_code=401, detail="Invalid token")

        logging.info("Authenticated user: %s", staff_id)
        return staff_id

    except (ExpiredSignatureError, JWTError, ValueError) as e:
        logging.error(f"Token decoding failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# --- Feedback submission endpoint ---
@router.post("/api/feedback")
async def submit_feedback(
    message: str = Form(...),
    feedback_type: str = Form(...),
    staff_id: str = Depends(get_current_user)
):
    cur = conn.cursor()
    try:
        # Convert UTC to Malaysia time
        malaysia_tz = timezone("Asia/Kuala_Lumpur")
        current_time = datetime.now(dt_timezone.utc).astimezone(malaysia_tz)
        timestamp = current_time.strftime("%Y-%m-%d %H:%M:%S")

        # Get user's name from DB
        cur.execute(
            "SELECT name FROM users WHERE LOWER(staff_id) = LOWER(%s)",
            (staff_id,)
        )
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Staff not found")
        name = result[0]

        # Insert feedback
        cur.execute("""
            INSERT INTO feedback (staff_id, name, feedback_type, message, date_time)
            VALUES (%s, %s, %s, %s, %s)
        """, (staff_id, name, feedback_type, message, timestamp))
        conn.commit()

        logging.info("Feedback submitted by %s: %s", staff_id, feedback_type)

    except Exception as e:
        conn.rollback()
        logging.error("Database error during feedback submission: %s", e)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cur.close()

    return {"message": "Feedback submitted successfully"}
