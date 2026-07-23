import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "ledgermind.db")
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

clients=[
("ABC Traders","Manufacturing","33ABCDE1234F1Z5",18,0.12),
("SK Industries","Electronics","33SKIND5678G1Z2",35,0.42),
("Prime Logistics","Transport","33PRIME4321H1Z9",22,0.25),
("Green Foods","Food Processing","33GREEN9876K1Z4",9,0.05),
("RK Solutions","IT Services","33RKSOL1111P1Z6",48,0.60),
("Sunrise Textiles","Textiles","33SUNRI1234A1Z8",14,0.18),
("Metro Hardware","Retail","33METRO9876B1Z7",27,0.30),
("Blue Star Pharma","Healthcare","33BLUE4321C1Z9",20,0.15),
("Delta Machines","Engineering","33DELTA7654D1Z8",42,0.55),
("Future Plastics","Packaging","33FUTUR6789E1Z2",16,0.20),
]
cur.executemany("INSERT INTO clients (name,sector,gstin,avg_payment_delay_days,past_default_rate) VALUES (?,?,?,?,?)",clients)

invoice_data=[(1, 'INV-1001', '2026-06-20', '2026-07-25', 185000, 33300, 'unpaid', None, 0.91), (2, 'INV-1002', '2026-06-22', '2026-07-28', 142000, 25560, 'unpaid', None, 0.82), (3, 'INV-1003', '2026-06-25', '2026-08-05', 98000, 17640, 'unpaid', None, 0.54), (4, 'INV-1004', '2026-06-27', '2026-08-08', 76000, 13680, 'paid', '2026-07-18', 0.08), (5, 'INV-1005', '2026-06-29', '2026-08-10', 214000, 38520, 'unpaid', None, 0.71), (6, 'INV-1006', '2026-07-05', '2026-08-30', 91000, 16380, 'unpaid', None, 0.41), (7, 'INV-1007', '2026-07-06', '2026-09-05', 126000, 22680, 'unpaid', None, 0.63), (8, 'INV-1008', '2026-07-08', '2026-09-10', 155000, 27900, 'paid', '2026-07-19', 0.1), (9, 'INV-1009', '2026-07-09', '2026-09-12', 82000, 14760, 'unpaid', None, 0.58), (10, 'INV-1010', '2026-07-10', '2026-09-15', 268000, 48240, 'unpaid', None, 0.94), (1, 'INV-1011', '2026-07-12', '2026-10-05', 92000, 16560, 'unpaid', None, 0.36), (2, 'INV-1012', '2026-07-13', '2026-10-08', 134000, 24120, 'unpaid', None, 0.74), (3, 'INV-1013', '2026-07-14', '2026-10-10', 72000, 12960, 'paid', '2026-07-18', 0.11), (4, 'INV-1014', '2026-07-15', '2026-10-12', 164000, 29520, 'unpaid', None, 0.52), (5, 'INV-1015', '2026-07-16', '2026-10-15', 246000, 44280, 'unpaid', None, 0.88), (6, 'INV-1016', '2026-07-18', '2026-11-10', 118000, 21240, 'unpaid', None, 0.27), (7, 'INV-1017', '2026-07-19', '2026-11-15', 87000, 15660, 'unpaid', None, 0.46), (8, 'INV-1018', '2026-07-20', '2026-11-18', 194000, 34920, 'paid', '2026-07-21', 0.09), (9, 'INV-1019', '2026-07-21', '2026-11-22', 143000, 25740, 'unpaid', None, 0.69), (10, 'INV-1020', '2026-07-22', '2026-11-25', 228000, 41040, 'unpaid', None, 0.92), (5, 'INV-1021', '2026-01-05', '2026-02-05', 254000, 45720, 'unpaid', None, 0.98), (2, 'INV-1022', '2026-01-18', '2026-02-18', 142000, 25560, 'unpaid', None, 0.83), (7, 'INV-1023', '2026-02-02', '2026-03-04', 173000, 31140, 'unpaid', None, 0.79), (8, 'INV-1024', '2026-02-15', '2026-03-17', 93000, 16740, 'paid', '2026-03-10', 0.12), (4, 'INV-1025', '2026-02-20', '2026-03-22', 211000, 37980, 'unpaid', None, 0.67), (6, 'INV-1026', '2026-05-10', '2026-06-10', 81000, 14580, 'paid', '2026-06-08', 0.07), (1, 'INV-1027', '2026-05-18', '2026-06-18', 94000, 16920, 'paid', '2026-06-20', 0.09), (9, 'INV-1028', '2026-05-22', '2026-06-22', 158000, 28440, 'paid', '2026-06-25', 0.13), (3, 'INV-1029', '2026-05-25', '2026-06-25', 109000, 19620, 'paid', '2026-06-27', 0.14), (10, 'INV-1030', '2026-05-28', '2026-06-28', 178000, 32040, 'paid', '2026-06-29', 0.11)]

for inv in invoice_data:
    client_id,number,inv_date,due_date,amount,gst,status,payment,risk=inv
    cur.execute("INSERT INTO invoices (client_id,invoice_number,invoice_date,due_date,amount,gst_rate,gst_amount,payment_date,status,risk_score,credit_note_issued) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    (client_id,number,inv_date,due_date,amount,18,gst,payment,status,risk,0))
conn.commit()
conn.close()
print("LedgerMind Demo Data Loaded")
