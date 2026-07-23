"""
LedgerMind AI - Synthetic data generator

Creates a realistic set of Indian MSME clients + invoices for demo purposes.
Run this after database.py has created the schema.
"""
import random
from datetime import date, timedelta
from database import get_db, init_db

random.seed(42)

SECTORS = ["IT Services", "Manufacturing", "Advertising", "Consulting",
           "Textiles", "Logistics", "F&B", "Healthcare Services"]

CLIENT_NAMES = [
    "Bhagat Textiles Pvt Ltd", "NovaTech Solutions", "Chennai Freight Co",
    "Everest Advertising", "Silver Line Manufacturing", "Bright Path Consulting",
    "Coastal Foods Pvt Ltd", "Quantum Design Studio", "Vishal & Co",
    "Green Valley Exports", "Metro Healthcare Systems", "Tamil Nadu Steel Works",
    "Skyline Logistics", "Prime Electronics", "Sunrise Apparel",
    "Digital Edge Media", "Anna Engineering Works", "Delta Pharma Distributors",
    "Coral Reef Hospitality", "Urban Nest Interiors",
]

TODAY = date(2026, 7, 19)  # matches "current date" for a coherent demo narrative


def random_date_within(days_back_min, days_back_max):
    d = random.randint(days_back_min, days_back_max)
    return TODAY - timedelta(days=d)


def build_clients(conn):
    cur = conn.cursor()
    client_ids = []
    for name in CLIENT_NAMES:
        sector = random.choice(SECTORS)
        # Some clients are chronically slow payers, some are reliable
        payer_type = random.choices(
            ["reliable", "slow", "risky"], weights=[0.45, 0.35, 0.20]
        )[0]
        if payer_type == "reliable":
            avg_delay = random.uniform(0, 10)
            default_rate = random.uniform(0.0, 0.03)
        elif payer_type == "slow":
            avg_delay = random.uniform(25, 55)
            default_rate = random.uniform(0.03, 0.12)
        else:
            avg_delay = random.uniform(60, 120)
            default_rate = random.uniform(0.15, 0.35)

        gstin = f"33{random.randint(10000,99999)}{random.choice('ABCDEFGH')}{random.randint(1000,9999)}Z{random.randint(1,9)}"
        cur.execute(
            "INSERT INTO clients (name, sector, gstin, avg_payment_delay_days, past_default_rate) "
            "VALUES (?, ?, ?, ?, ?)",
            (name, sector, gstin, round(avg_delay, 1), round(default_rate, 3)),
        )
        client_ids.append((cur.lastrowid, payer_type))
    conn.commit()
    return client_ids


def build_invoices(conn, client_ids, n_invoices=90):
    cur = conn.cursor()
    inv_no = 1000

    for i in range(n_invoices):
        client_id, payer_type = random.choice(client_ids)
        invoice_date = random_date_within(5, 220)
        terms_days = random.choice([15, 30, 45])
        due_date = invoice_date + timedelta(days=terms_days)

        amount = round(random.uniform(15000, 450000), 2)
        gst_rate = random.choice([18.0, 12.0])
        gst_amount = round(amount * gst_rate / 100, 2)

        # decide payment behaviour based on payer_type
        if payer_type == "reliable":
            paid_prob = 0.85
            delay_range = (0, 15)
        elif payer_type == "slow":
            paid_prob = 0.6
            delay_range = (20, 70)
        else:
            paid_prob = 0.35
            delay_range = (45, 150)

        days_since_invoice = (TODAY - invoice_date).days
        is_paid = random.random() < paid_prob and days_since_invoice > 10

        payment_date = None
        status = "unpaid"
        if is_paid:
            delay = random.randint(*delay_range)
            pay_date = invoice_date + timedelta(days=terms_days + delay)
            if pay_date <= TODAY:
                payment_date = pay_date.isoformat()
                status = "paid"

        if status == "unpaid" and days_since_invoice > due_date.toordinal() - invoice_date.toordinal():
            pass  # keep as unpaid; overdue-ness derived at query time from due_date

        inv_no += 1
        cur.execute(
            """INSERT INTO invoices
               (client_id, invoice_number, invoice_date, due_date, amount, gst_rate, gst_amount,
                payment_date, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (client_id, f"INV-2026-{inv_no}", invoice_date.isoformat(), due_date.isoformat(),
             amount, gst_rate, gst_amount, payment_date, status),
        )
    conn.commit()


def main():
    init_db()
    conn = get_db()
    client_ids = build_clients(conn)
    build_invoices(conn, client_ids, n_invoices=95)
    conn.close()
    print("Synthetic demo data generated: 20 clients, 95 invoices.")


if __name__ == "__main__":
    main()
