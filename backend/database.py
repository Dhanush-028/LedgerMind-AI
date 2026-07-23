"""
LedgerMind AI - Database layer
SQLite schema + connection helper.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "ledgermind.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create tables from scratch (drops existing data)."""
    conn = get_db()
    cur = conn.cursor()

    cur.executescript("""
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS clients;

    CREATE TABLE clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sector TEXT NOT NULL,
        gstin TEXT,
        avg_payment_delay_days REAL DEFAULT 0,   -- historical avg delay beyond due date
        past_default_rate REAL DEFAULT 0         -- 0-1, fraction of past invoices that went bad
    );

    CREATE TABLE invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        invoice_number TEXT NOT NULL,
        invoice_date TEXT NOT NULL,      -- ISO date
        due_date TEXT NOT NULL,          -- ISO date (invoice_date + client terms)
        amount REAL NOT NULL,            -- taxable value
        gst_rate REAL NOT NULL DEFAULT 18.0,
        gst_amount REAL NOT NULL,
        payment_date TEXT,               -- NULL if unpaid
        status TEXT NOT NULL DEFAULT 'unpaid',  -- unpaid | paid | written_off
        risk_score REAL,                 -- filled by ML model, 0-1 probability of bad debt
        credit_note_issued INTEGER DEFAULT 0
    );
    """)
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
