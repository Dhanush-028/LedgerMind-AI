# LedgerMind AI

An AI-powered cash-flow intelligence tool for MSMEs, built to address a specific pain
point: **India's accrual-based GST forces small businesses to pay GST on invoices before
they've actually been paid by the client.** LedgerMind AI doesn't change the law — it makes
the resulting cash-flow damage visible, predicts which invoices are likely to go bad before
the 180-day ITC-reversal deadline, and reframes client profitability around real cash cost,
not invoiced revenue.

## What it does

1. **GST cash-drag dashboard** — headline number showing GST already paid/liable on unpaid
   invoices ("locked capital"), plus a live 180-day ITC-reversal countdown per invoice.
2. **AI bad-debt risk scoring** — an XGBoost classifier trained on invoice age, amount,
   and each client's historical payment behaviour predicts the probability an unpaid
   invoice turns into unrecoverable bad debt.
3. **Per-client true-cost view** — reframes each client's value as revenue minus GST
   cash-flow drag minus risk-weighted exposure, surfacing which clients are actually
   unprofitable once GST timing is priced in.
4. **Credit-note decision assistant** — a rules engine that recommends issue-credit-note vs.
   pursue-legally vs. escalate-collections vs. wait, based on the 180-day clock and predicted
   risk (the "credit note dilemma": issuing one forecloses legal recovery of the debt).

## Stack

- **Backend:** Flask + SQLite, XGBoost (scikit-learn/pandas for feature engineering)
- **Frontend:** React (Vite) + Recharts, dark theme with a lime accent

## Project structure

```
ledgermind-ai/
├── backend/
│   ├── app.py                  # Flask API
│   ├── database.py             # SQLite schema
│   ├── generate_data.py        # synthetic demo data (20 clients, ~95 invoices)
│   ├── train_risk_model.py     # trains + saves the XGBoost risk model
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── Sidebar.jsx
    │       ├── Dashboard.jsx
    │       ├── InvoiceList.jsx
    │       ├── ClientRisk.jsx
    │       └── Badges.jsx
    └── package.json
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt --break-system-packages   # or use a venv
python3 database.py          # create schema
python3 generate_data.py     # seed synthetic demo data
python3 train_risk_model.py  # train risk model, score all invoices
python3 app.py               # runs on http://127.0.0.1:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # runs on http://127.0.0.1:5173, proxies /api to Flask
```

Open http://127.0.0.1:5173 — the dev server proxies all `/api/*` calls to Flask automatically
(see `vite.config.js`).

## Demo data note

All client names and invoices are synthetically generated (`generate_data.py`, seeded with
`random.seed(42)` for reproducibility) — no real business data. The "current date" used
throughout the app (for computing overdue days and the 180-day clock) is fixed at
**19 July 2026** so the numbers stay consistent for a recorded demo regardless of when you
run it. To use a different reference date, change `TODAY` in `app.py`,
`generate_data.py`, and `train_risk_model.py`.

## What's intentionally out of scope for this prototype

- Real GSTN/GSP API integration (requires GSP registration — roadmap item)
- Multi-tenant auth (single demo login assumed)
- WhatsApp/SMS collection nudges (straightforward to add — same pattern as bilingual SMS
  alerts already built for a prior project)
- Actual legal-recovery workflow (the assistant only surfaces the recommendation)

## Suggested demo flow (for a ~2 min video)

1. **Dashboard** — open on the big locked-capital number: "this business has ₹X locked up
   in GST paid on money it hasn't collected yet."
2. Point at the 180-day breached count — "these invoices have already lost their ITC-refund
   window — that's dead tax."
3. **Invoices tab** — click into a high-risk invoice, show the AI recommendation
   (credit note vs. pursue legally vs. escalate).
4. **Client Risk tab** — show a client with negative net value once GST drag + risk exposure
   is priced in — "this client looks profitable on paper, isn't in practice."
5. Close on roadmap: GSTN integration, WhatsApp nudges.
