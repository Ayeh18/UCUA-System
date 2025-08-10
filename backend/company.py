from fastapi import APIRouter, HTTPException
from config import conn

router = APIRouter()

@router.get("/api/companies")
async def get_companies():
    cur = conn.cursor()
    try:
        # No ORDER BY, retrieves as-is from the table
        cur.execute("SELECT company_name FROM company")
        companies = [row[0] for row in cur.fetchall()]
        return companies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching companies: {str(e)}")
    finally:
        cur.close()
