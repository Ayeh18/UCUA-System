from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg2.extras import RealDictCursor
import logging

from config import conn  # Directly import the shared connection

# Setup router and logging
router = APIRouter()
logging.basicConfig(level=logging.INFO)

def get_locations():
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT location FROM locations")
            rows = cursor.fetchall()
            return [row["location"] for row in rows]
    except Exception as e:
        logging.error("Database query error: %s", e)
        raise HTTPException(status_code=500, detail="Database query error")

@router.get("/api/locations")
def read_locations():
    locations = get_locations()
    return JSONResponse(content=locations)
