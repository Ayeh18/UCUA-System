from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import List
from datetime import datetime
from jose import jwt, JWTError, ExpiredSignatureError
from pytz import timezone
from datetime import timezone as dt_timezone
import os
import shutil
import logging

from config import SECRET_KEY, ALGORITHM, conn

# Initialize Router and Token system
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="accessToken")
logging.basicConfig(level=logging.INFO)

# Token validation
def get_staff_id_from_token(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id = payload.get("sub")
        if not staff_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        return staff_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/api/form_staff")
async def submit_observation(
    classification: str = Form(...),
    stopWork: str = Form(...),
    observation: str = Form(...),
    action: str = Form(...),
    location: str = Form(...),
    specificLocation: str = Form(""),
    images: List[UploadFile] = File([]),
    staff_id: str = Depends(get_staff_id_from_token),
):
    # Timezone adjustment
    malaysia_tz = timezone('Asia/Kuala_Lumpur')
    date_time_utc = datetime.now(dt_timezone.utc)
    date_time_malaysia = date_time_utc.astimezone(malaysia_tz)
    date_time_malaysia_str = date_time_malaysia.strftime("%Y-%m-%d %H:%M:%S")
    month = date_time_malaysia.strftime("%B")

    cur = conn.cursor()
    try:
        # Fetch user data
        cur.execute(
            "SELECT name, department, designation FROM users WHERE LOWER(staff_id) = LOWER(%s)",
            (staff_id,)
        )
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Staff not found")
        name, department, designation = result

        # Save images
        upload_dir = "uploaded_images"
        os.makedirs(upload_dir, exist_ok=True)
        image_paths = []
        for image in images:
            filename = f"{datetime.utcnow().timestamp()}_{image.filename}"
            image_path = os.path.join(upload_dir, filename)
            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            image_paths.append(image_path)

        # Insert observation into DB (without phone_number)
        cur.execute("""
            INSERT INTO data_bank (
                staff_id, name, department, designation,
                date_time, month,
                location, specific_location, observation_classification,
                call_for_stopwork, observation, corrective_action, image
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            staff_id, name, department, designation,
            date_time_malaysia_str, month,
            location, specificLocation, classification,
            stopWork, observation, action, image_paths
        ))
        conn.commit()

    except Exception as e:
        conn.rollback()
        logging.error("Database insert error: %s", e)
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")
    finally:
        cur.close()

    return {"message": "Observation submitted successfully"}
