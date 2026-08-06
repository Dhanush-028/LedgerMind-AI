"""
gemini_service.py

Wraps the Gemini API (google-genai) for two jobs used by the AI Invoice Analyzer:
  1. extract_invoice_data     -> OCR + structured extraction from an uploaded invoice file
  2. analyze_portfolio_risk   -> reads unpaid invoices and returns AI-scored insights

Install:  pip install google-genai pydantic
Env:      GEMINI_API_KEY must be set (never expose this to the frontend)
"""
import os
import json
from typing import List, Literal

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
from preprocess import preprocess_invoice_image


load_dotenv()  # reads .env so this file works no matter what order it's imported in

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Create a .env file in the backend/ folder "
        "with a line: GEMINI_API_KEY=your-key-here"
    )

client = genai.Client(api_key=api_key)
print("===== AVAILABLE MODELS =====")

try:
    for model in client.models.list():
        print(model.name)
except Exception as e:
    print("ERROR:", e)

print("============================")

MODEL = "gemini-flash-latest"# current stable flash model. gemini-2.5-flash was cut off for new users July 9, 2026.


# ---------------------------------------------------------------------------
# 1. Invoice OCR / extraction
# ---------------------------------------------------------------------------

class InvoiceExtraction(BaseModel):
    client_name: str
    invoice_number: str
    invoice_date: str
    due_date: str

    taxable_amount: float

    gst_rate: float          # NEW

    gst_amount: float

    cgst: float              # NEW

    sgst: float              # NEW

    igst: float              # NEW

    total: float

    gstin: str

    confidence: Literal["high", "medium", "low"]


def extract_invoice_data(file_bytes: bytes, mime_type: str) -> dict:
    # Preprocess only if it's an image
    if mime_type in ["image/jpeg", "image/png", "image/webp"]:
        file_bytes = preprocess_invoice_image(file_bytes)
        mime_type = "image/png"  # after preprocessing we save as PNG

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            """
You are an OCR engine specialized in Indian GST invoices.

Your ONLY job is to read the invoice exactly as printed.

IMPORTANT RULES:

1. Read ONLY the text visible in the invoice.

2. NEVER calculate GST.

3. NEVER calculate Grand Total.

4. NEVER fix arithmetic mistakes.

5. NEVER estimate missing values.

6. NEVER generate sample data.

7. NEVER replace unreadable values.

8. If a field is unreadable, return:
- "" for text
- 0 for numbers

Return ONLY valid JSON matching the schema.

Extract EXACTLY these fields:

client_name

invoice_number

invoice_date (YYYY-MM-DD)

due_date (YYYY-MM-DD)

taxable_amount

gst_rate

cgst

sgst

igst

gst_amount

total

gstin

confidence

VERY IMPORTANT:

If the invoice shows:

Taxable = 60000
CGST = 5000
SGST = 5000
GST = 10000
Grand Total = 70000

then return EXACTLY:

{
"taxable_amount":60000,
"cgst":5000,
"sgst":5000,
"igst":0,
"gst_amount":10000,
"total":70000
}

DO NOT change GST to 10800.

DO NOT change Total to 70800.

Return exactly what is printed on the invoice.
"""
        ],    
        config={
            "response_mime_type": "application/json",
            "response_schema": InvoiceExtraction,
        },
    )
    data = json.loads(response.text)

    print("========== GEMINI OCR ==========")
    print(response.text)
    print("==============================")

# If Gemini didn't return GST amount, derive it from CGST/SGST or IGST
# Convert numeric fields first
    data["gst_rate"] = float(data.get("gst_rate", 18))
    data["cgst"] = float(data.get("cgst", 0))
    data["sgst"] = float(data.get("sgst", 0))
    data["igst"] = float(data.get("igst", 0))
    data["gst_amount"] = float(data.get("gst_amount", 0))

# If Gemini didn't return GST amount, derive it from the extracted tax components
    if data["gst_amount"] == 0:

        if data["cgst"] > 0 or data["sgst"] > 0:
            data["gst_amount"] = data["cgst"] + data["sgst"]

        elif data["igst"] > 0:
            data["gst_amount"] = data["igst"]

    return data



# ---------------------------------------------------------------------------
# 2. Portfolio-level risk analysis
# ---------------------------------------------------------------------------

class FlaggedInvoice(BaseModel):
    invoice_id: int
    reason: str
    recommended_action: Literal[
        "send_reminder", "escalate_collections", "issue_credit_note", "pursue_legally", "monitor"
    ]
    urgency: Literal["low", "medium", "high", "critical"]


class RiskAnalysis(BaseModel):
    summary: str
    flagged_invoices: List[FlaggedInvoice]
    portfolio_insights: List[str]


def analyze_portfolio_risk(invoices: list) -> dict:
    """
    invoices: list of dicts from GET /api/invoices?status=unpaid — each needs
    id, client_name, total, days_overdue, risk_score, clock_180day.
    Returns a dict matching RiskAnalysis.
    """
    compact = [
        {
            "id": inv["id"],
            "client": inv["client_name"],
            "total": inv["total"],
            "days_overdue": inv["days_overdue"],
            "existing_risk_score": inv["risk_score"],
            "itc_clock_status": inv["clock_180day"],
        }
        for inv in invoices
    ]

    prompt = (
        "You are a cashflow risk analyst for an Indian MSME. Below is a JSON list of unpaid invoices, "
        "each already carrying a rule-based risk_score (0-1) and ITC 180-day clock status. "
        "Identify which invoices most urgently need action, why, and what action to take. "
        "Also surface any cross-invoice patterns (e.g. a single client repeatedly late, "
        "concentration risk in one client, or a cluster nearing the 180-day ITC reversal deadline). "
        "Be concise and specific — this is read by a busy small-business owner.\n\n"
        f"Invoices:\n{json.dumps(compact)}"
    )

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": RiskAnalysis,
        },
    )
    return json.loads(response.text)


# ---------------------------------------------------------------------------
# 3. AI Copilot business insight (upgrades the old template-only summary)
# ---------------------------------------------------------------------------

class BusinessInsight(BaseModel):
    severity: Literal["healthy", "caution", "critical"]
    headline: str
    summary: str
    actions: List[str]


def generate_business_insight(context: dict) -> dict:
    """
    context: the same underlying numbers your template generator already computes
    (locked_gst, total_exposure, unpaid_count, breached_count, critical_count,
    top_high_risk: [{client, amount, risk_score}], worst_client: {name, revenue, cost} or None)
    Returns a dict matching BusinessInsight.
    """
    prompt = (
        "You are an AI CFO copilot for an Indian MSME textile business. Given the JSON cash-flow "
        "and GST data below, write:\n"
        "- a severity level (healthy/caution/critical)\n"
        "- a short, punchy headline (under 8 words)\n"
        "- a 2-4 sentence plain-English summary a busy founder can read in 5 seconds\n"
        "- 2-4 concrete, prioritized actions, each one sentence\n\n"
        "Be specific — name amounts and clients where the data provides them. Do not invent numbers "
        "not present in the data.\n\n"
        f"Data:\n{json.dumps(context)}"
    )

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": BusinessInsight,
        },
    )
    return json.loads(response.text)


# ---------------------------------------------------------------------------
# 4. Conversational AI chat
# ---------------------------------------------------------------------------

def answer_chat_question(question: str, context: dict, history: list) -> str:
    """
    question: the user's latest message
    context: a snapshot of their business data (dashboard summary + invoice list + client risk)
    history: list of {"role": "user"|"model", "text": str} from earlier turns in this chat
    Returns plain text (not JSON — chat replies read better as natural prose).
    """
    contents = []
    for turn in history[-8:]:  # keep prompts small — last 8 turns is plenty of context
        role = "model" if turn.get("role") == "model" else "user"
        contents.append({"role": role, "parts": [{"text": turn.get("text", "")}]})

    contents.append({
        "role": "user",
        "parts": [{
            "text": (
                "You are an AI CFO copilot for an Indian MSME. Answer the founder's question using "
                "ONLY the business data JSON below — never invent numbers. If the data doesn't contain "
                "the answer, say so plainly and suggest where they could check. Keep replies short "
                "(2-5 sentences) and concrete, naming real client/invoice values from the data when relevant.\n\n"
                f"Business data:\n{json.dumps(context)}\n\n"
                f"Question: {question}"
            )
        }],
    })

    response = client.models.generate_content(model=MODEL, contents=contents)
    return response.text


# ---------------------------------------------------------------------------
# 5. Cash-flow forecast narrative
# ---------------------------------------------------------------------------

class CashflowForecastNarrative(BaseModel):
    summary: str
    risks: List[str]
    recommendations: List[str]


def generate_cashflow_narrative(projection: dict) -> dict:
    """
    projection: bucketed expected cash inflow, e.g.
      {"0-30": 120000.0, "31-60": 45000.0, "61-90": 12000.0, "90+": 8000.0}
    (already probability-weighted by risk_score — see compute_cashflow_projection in app.py)
    Returns a dict matching CashflowForecastNarrative.
    """
    prompt = (
        "You are a cash-flow analyst for an Indian MSME. Below is a probability-weighted forecast "
        "of expected cash inflow from currently unpaid invoices, bucketed by expected collection "
        "window (days from today). Write:\n"
        "- a 2-3 sentence plain-English summary of what this forecast means for the business\n"
        "- 1-3 specific risks visible in this shape of forecast (e.g. heavy back-loading into 90+ days)\n"
        "- 1-3 concrete recommendations to improve near-term cash position\n\n"
        f"Forecast (INR, already risk-weighted):\n{json.dumps(projection)}"
    )

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": CashflowForecastNarrative,
        },
    )
    return json.loads(response.text)