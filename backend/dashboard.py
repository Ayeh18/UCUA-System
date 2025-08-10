from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from jose import JWTError, jwt
from config import SECRET_KEY, ALGORITHM, conn
from psycopg2.extras import RealDictCursor
from typing import Optional
import logging

router = APIRouter()

# --- Authentication helper ---
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        logging.warning("Authorization header missing")
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            logging.warning("Invalid authentication scheme")
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id: str = payload.get("sub")
        if not staff_id:
            logging.warning("Token missing 'sub' claim")
            raise HTTPException(status_code=401, detail="Invalid token")

        return staff_id
    except (JWTError, ValueError) as e:
        logging.error(f"Token decoding failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# --- Endpoint: Get report count ---
from datetime import datetime
import logging

@router.get("/report_count")
def get_report_count(current_user: str = Depends(get_current_user)):
    cur = conn.cursor()
    try:
        # Get the current datetime and calculate the first day of the month
        now = datetime.now()
        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Convert `first_day_of_month` to string for better compatibility with the query
        first_day_of_month_str = first_day_of_month.strftime("%Y-%m-%d %H:%M:%S")

        # Log inputs and query parameters
        # logging.info(f"Fetching report count for user: {current_user}")
        # logging.info(f"First day of the month: {first_day_of_month_str}")

        # Execute the query
        cur.execute(
            "SELECT COUNT(*) FROM data_bank WHERE staff_id = %s AND date_time >= %s",
            (current_user, first_day_of_month_str)
        )

        # Fetch and validate the result
        result = cur.fetchone()
        if result is None:
            logging.warning(f"No data returned for user: {current_user}")
            count = 0
        else:
            count = result[0]
        
        # Log the result of the query
        # logging.info(f"Report count for {current_user}: {count}")

        return {"report_count": count}

    except Exception as e:
        logging.error(f"Error while fetching report count: {e}")
        raise e
    finally:
        cur.close()


# --- Endpoint: Leaderboard ---
@router.get("/leaderboard")
def get_leaderboard(current_user: str = Depends(get_current_user)):
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Fetch leaderboard based on total_points from points table
        cur.execute("""
            SELECT staff_id, total_points, report_count, updated_at
            FROM points
            ORDER BY total_points DESC, updated_at ASC
        """)
        rows = cur.fetchall()

        leaderboard = [
            {
                "rank": idx + 1,
                "staff_id": row["staff_id"],
                "points": row["total_points"],
                "reports": row["report_count"]
            }
            for idx, row in enumerate(rows)
        ]

        return {
            "leaderboard": leaderboard,
            "current_user": current_user
        }

    except Exception as e:
        logging.error(f"Error retrieving leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Unable to fetch leaderboard")


# --- Endpoint: Update points ---
@router.get("/update_points")
def update_points(
    current_user: str = Depends(get_current_user),
    reset_date: Optional[date] = Query(None, description="Date to trigger points reset")
):
    cur = conn.cursor()
    try:
        today = datetime.now().date()
        logging.info(f"[START] Updating points for user: {current_user}")

        # Get existing point record if any
        cur.execute("""
            SELECT daily_points, bonus_points, report_count, total_points, last_reset_date
            FROM points WHERE staff_id = %s
        """, (current_user,))
        row = cur.fetchone()

        if row:
            current_daily_points, current_bonus_points, current_report_count, current_total_points, last_reset_date = row
        else:
            current_daily_points = 0
            current_bonus_points = 0
            current_report_count = 0
            current_total_points = 0
            last_reset_date = None

        # Determine effective reset date
        effective_reset_date = reset_date if reset_date else today.replace(day=1)

        # Reset all points if needed
        if last_reset_date is None or last_reset_date < effective_reset_date:
            logging.info(f"Resetting points (last reset: {last_reset_date}, new reset: {effective_reset_date})")
            current_daily_points = 0
            current_bonus_points = 0
            current_report_count = 0
            current_total_points = 0
            last_reset_date = effective_reset_date

        # Count today's reports
        cur.execute("""
            SELECT COUNT(*) FROM data_bank 
            WHERE staff_id = %s AND date_time::date = %s
        """, (current_user, today))
        reports_today = cur.fetchone()[0]

        # Count total reports since reset
        cur.execute("""
            SELECT COUNT(*) FROM data_bank 
            WHERE staff_id = %s AND date_time::date >= %s
        """, (current_user, last_reset_date))
        report_count_since_reset = cur.fetchone()[0]

        # Count distinct days user submitted a report
        cur.execute("""
            SELECT COUNT(DISTINCT date_time::date) 
            FROM data_bank 
            WHERE staff_id = %s AND date_time::date >= %s
        """, (current_user, last_reset_date))
        unique_report_days = cur.fetchone()[0]

        # Add daily point if today is a new unique day with a report
        if reports_today > 0 and current_daily_points < unique_report_days:
            current_daily_points += 1

        # Count how many days the user submitted 3 or more reports
        cur.execute("""
            SELECT COUNT(*) FROM (
                SELECT date_time::date AS report_day, COUNT(*) AS reports_on_day
                FROM data_bank
                WHERE staff_id = %s AND date_time::date >= %s
                GROUP BY report_day
                HAVING COUNT(*) >= 3
            ) AS qualifying_days;
        """, (current_user, last_reset_date))
        qualifying_days = cur.fetchone()[0]

        # Calculate bonus points
        current_bonus_points = qualifying_days * 5

        # Finalize points
        current_report_count = report_count_since_reset
        current_total_points = current_report_count + current_daily_points + current_bonus_points

        # Save into DB
        cur.execute("""
            INSERT INTO points (
                staff_id, report_count, daily_points, bonus_points, total_points,
                last_reset_date, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (staff_id) DO UPDATE
            SET report_count = EXCLUDED.report_count,
                daily_points = EXCLUDED.daily_points,
                bonus_points = EXCLUDED.bonus_points,
                total_points = EXCLUDED.total_points,
                last_reset_date = EXCLUDED.last_reset_date,
                updated_at = CURRENT_TIMESTAMP
        """, (
            current_user,
            current_report_count,
            current_daily_points,
            current_bonus_points,
            current_total_points,
            last_reset_date
        ))

        conn.commit()

        return {
            "points": {
                "report_count": current_report_count,
                "daily_points": current_daily_points,
                "bonus_points": current_bonus_points,
                "total_points": current_total_points,
                "last_reset_date": last_reset_date,
                "reports_today": reports_today
            }
        }

    except Exception as e:
        conn.rollback()
        logging.error(f"[ERROR] Failed to update points for user {current_user}: {e}")
        raise HTTPException(status_code=500, detail="Error updating points")

    finally:
        cur.close()
