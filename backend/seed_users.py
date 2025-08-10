import psycopg2
import bcrypt

# Database connection configuration
DB_HOST = "haha"
DB_NAME = "hhaa"
DB_USER = "hah"
DB_PASSWORD = "haha"

# User data to seed
users = [
    {
        "staff_id": "AFE0026",
        "password": "tbsb1234",
        "name": "MOHAMAD AZHAR BIN MOHAMAD APANDI",
        "designation": "OPERATOR",
        "department": "AFE",
        "dept_qhse": "AFE"
    },
]

def hash_password(password):
    """Hashes a plain-text password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_users():
    """Seeds the users table with sample data."""
    conn = None
    cur = None
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cur = conn.cursor()

        # Insert user data
        for user in users:
            hashed_password = hash_password(user["password"])
            cur.execute(
                """
                INSERT INTO users (staff_id, password, name, designation, department, dept_qhse)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (staff_id) DO NOTHING
                """,
                (
                    user["staff_id"],
                    hashed_password,
                    user["name"],
                    user["designation"],
                    user["department"],
                    user["dept_qhse"]
                )
            )
        
        # Commit the transaction
        conn.commit()
        print("Seed data inserted successfully.")
    
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_users()
