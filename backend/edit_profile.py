from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError, ExpiredSignatureError
from config import SECRET_KEY, ALGORITHM, conn
import os
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Directory to save profile pictures (adjust as needed)
UPLOAD_DIR = "./uploads/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
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

@router.put("/profile")
async def update_user_profile(
    username: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    designation: str = Form(...),
    department: str = Form(...),
    profile_pic: UploadFile = File(None),  # Optional file upload
    staff_id: str = Depends(get_current_user)
):
    cur = conn.cursor()
    try:
        # Check if user exists
        cur.execute("SELECT 1 FROM users WHERE LOWER(staff_id) = LOWER(%s)", (staff_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        # Handle profile picture upload
        profile_pic_path = None
        if profile_pic:
            # Generate a unique filename
            file_extension = profile_pic.filename.split(".")[-1]
            filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Save the file
            with open(file_path, "wb") as f:
                f.write(await profile_pic.read())
            profile_pic_path = file_path

        # Update query with profile_pic
        if profile_pic_path:
            query = """
                UPDATE users
                SET username = %s,
                    email = %s,
                    phone_number = %s,
                    designation = %s,
                    department = %s,
                    profile_pic = %s
                WHERE LOWER(staff_id) = LOWER(%s)
            """
            params = (username, email, phone, designation, department, profile_pic_path, staff_id)
        else:
            query = """
                UPDATE users
                SET username = %s,
                    email = %s,
                    phone_number = %s,
                    designation = %s,
                    department = %s
                WHERE LOWER(staff_id) = LOWER(%s)
            """
            params = (username, email, phone, designation, department, staff_id)
        cur.execute(query, params)

        conn.commit()
        return {"message": "Profile updated successfully"}

    except Exception as e:
        print(f"Update error: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while updating profile.")
    finally:
        cur.close()