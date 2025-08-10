from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from typing import List
import os, shutil, logging
from datetime import datetime, timezone as dt_timezone
from pytz import timezone
from config import conn

router = APIRouter()
UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/form_visitor")
async def submit_report(
    name: str = Form(...),
    phone: str = Form(...),
    designation: str = Form(...),
    company: str = Form(...),
    otherCompany: str = Form(""),
    location: str = Form(...),
    otherLocation: str = Form(""),
    classification: str = Form(...),
    stopWork: str = Form(...),
    observation: str = Form(...),
    action: str = Form(...),
    images: List[UploadFile] = File([]),
):
    cur = conn.cursor()

    try:
        # ✅ Validate company
        cur.execute("SELECT 1 FROM company WHERE company_name = %s", (company,))
        if not cur.fetchone():
            raise HTTPException(status_code=400, detail="Selected company is not registered.")

        # Malaysia time
        malaysia_tz = timezone("Asia/Kuala_Lumpur")
        date_time_utc = datetime.now(dt_timezone.utc)
        date_time_malaysia = date_time_utc.astimezone(malaysia_tz)
        date_time_malaysia_str = date_time_malaysia.strftime("%Y-%m-%d %H:%M:%S")
        month = date_time_malaysia.strftime("%B")

        # Save images
        image_paths = []
        for img in images:
            filename = f"{datetime.utcnow().timestamp()}_{img.filename}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(img.file, buffer)
            image_paths.append(filepath)

        # Insert into DB
        cur.execute("""
            INSERT INTO data_bank_visitor (
                name, phone, designation, company, other_company, location,
                other_location, classification, stop_work, observation, action,
                image_urls, date_time, month
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            name, phone, designation, company, otherCompany, location,
            otherLocation, classification, stopWork, observation, action,
            image_paths, date_time_malaysia_str, month
        ))

        conn.commit()
        return {"message": "Visitor report submitted successfully."}

    except Exception as e:
        conn.rollback()
        logging.error("Visitor form error: %s", e)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    finally:
        cur.close()
