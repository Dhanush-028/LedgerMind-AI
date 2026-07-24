# LedgerMind AI

**Live demo:** https://ledgermind-ai-production.up.railway.app/

An AI-powered cash-flow tool for MSMEs. India's accrual-based GST forces
small businesses to pay GST on invoices before the client has actually
paid them. LedgerMind AI makes that cash-flow damage visible, predicts
which invoices are likely to go bad before the 180-day ITC-reversal
deadline, and shows the *real* cash cost of each client — not just their
invoiced revenue.

## What it does

- **GST cash-drag dashboard** — see the total GST already paid on unpaid
  invoices ("locked capital"), plus a live 180-day countdown per invoice.
- **AI bad-debt risk scoring** — predicts the odds an unpaid invoice
  turns into unrecoverable bad debt.
- **Per-client true-cost view** — reframes each client's value as
  revenue minus GST drag minus risk, showing which clients are actually
  unprofitable.
- **Credit-note decision assistant** — recommends issue-credit-note vs.
  pursue-legally vs. escalate-collections vs. wait.

## Try it

Just open the live link above — no setup needed. It's running on synthetic
demo data (20 clients, ~95 invoices), so nothing real is exposed.

## Stack

Flask + SQLite + XGBoost on the backend, React (Vite) + Recharts on the
frontend.

## Roadmap

Real GSTN/GSP integration, WhatsApp/SMS collection nudges, multi-tenant
auth, full legal-recovery workflow.