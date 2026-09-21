import sqlite3

DB_PATH = "interviews.db"

connection = sqlite3.connect(DB_PATH)
cursor = connection.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(resumes)")
columns = [row[1] for row in cursor.fetchall()]

if "skills" in columns:
    print("✅ skills column already exists.")
else:
    cursor.execute(
        "ALTER TABLE resumes ADD COLUMN skills TEXT"
    )

    connection.commit()

    print("✅ skills column added successfully.")

connection.close()