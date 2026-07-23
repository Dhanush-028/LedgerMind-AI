"""
report_generator.py

Turns an AI risk-insights result (from analyze_portfolio_risk) into a
downloadable PDF report.

Install: pip install reportlab
"""
import io
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

URGENCY_COLOR = {
    "low": colors.HexColor("#6b7280"),
    "medium": colors.HexColor("#d97706"),
    "high": colors.HexColor("#dc2626"),
    "critical": colors.HexColor("#dc2626"),
}


def _fmt_inr(n):
    try:
        return f"Rs {n:,.0f}"  # avoid unicode ₹ glyph issues in default PDF fonts
    except (TypeError, ValueError):
        return "Rs 0"


def generate_ai_report_pdf(insights: dict, invoice_lookup: dict, as_of: date) -> io.BytesIO:
    """
    insights: dict shaped like RiskAnalysis {summary, flagged_invoices, portfolio_insights}
    invoice_lookup: {invoice_id: {client_name, total, ...}} to enrich flagged rows
    as_of: date the report was generated
    Returns an in-memory PDF buffer, ready for send_file().
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=22 * mm, bottomMargin=18 * mm, leftMargin=18 * mm, rightMargin=18 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleX", parent=styles["Title"], fontSize=20, spaceAfter=4)
    meta_style = ParagraphStyle("Meta", parent=styles["Normal"], textColor=colors.grey, spaceAfter=16)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
    body = ParagraphStyle("BodyX", parent=styles["Normal"], leading=15)
    bullet = ParagraphStyle("Bullet", parent=styles["Normal"], leftIndent=12, leading=14, spaceAfter=4)

    story = []
    story.append(Paragraph("AI Cash-Flow Risk Report", title_style))
    story.append(Paragraph(f"LedgerMind AI &middot; generated {as_of.isoformat()}", meta_style))

    story.append(Paragraph("Summary", h2))
    story.append(Paragraph(insights.get("summary", ""), body))

    portfolio_insights = insights.get("portfolio_insights") or []
    if portfolio_insights:
        story.append(Paragraph("Portfolio Patterns", h2))
        for p in portfolio_insights:
            story.append(Paragraph(f"&bull; {p}", bullet))

    flagged = insights.get("flagged_invoices") or []
    if flagged:
        story.append(Paragraph("Flagged Invoices", h2))
        table_data = [["Client", "Amount", "Urgency", "Action", "Reason"]]
        for f in flagged:
            inv = invoice_lookup.get(f.get("invoice_id"), {})
            client = inv.get("client_name", f"Invoice #{f.get('invoice_id')}")
            amount = _fmt_inr(inv.get("total", 0))
            table_data.append([
                Paragraph(client, body),
                amount,
                f.get("urgency", "").upper(),
                f.get("recommended_action", "").replace("_", " "),
                Paragraph(f.get("reason", ""), body),
            ])

        col_widths = [85, 60, 55, 80, 190]
        t = Table(table_data, colWidths=[w * 0.75 for w in col_widths], repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(t)
    else:
        story.append(Spacer(1, 8))
        story.append(Paragraph("No invoices are currently flagged as high-risk.", body))

def generate_forecast_pdf(projection: dict, narrative: dict, as_of: date) -> io.BytesIO:
    """
    projection: {"0-30": float, "31-60": float, "61-90": float, "90+": float}
    narrative: {summary, risks, recommendations}
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=22 * mm, bottomMargin=18 * mm, leftMargin=18 * mm, rightMargin=18 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleX2", parent=styles["Title"], fontSize=20, spaceAfter=4)
    meta_style = ParagraphStyle("Meta2", parent=styles["Normal"], textColor=colors.grey, spaceAfter=16)
    h2 = ParagraphStyle("H2b", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
    body = ParagraphStyle("BodyX2", parent=styles["Normal"], leading=15)
    bullet = ParagraphStyle("Bullet2", parent=styles["Normal"], leftIndent=12, leading=14, spaceAfter=4)

    BUCKET_LABELS = {"0-30": "Next 30 days", "31-60": "31–60 days", "61-90": "61–90 days", "90+": "90+ days"}

    story = []
    story.append(Paragraph("Cash-Flow Forecast Report", title_style))
    story.append(Paragraph(f"LedgerMind AI &middot; generated {as_of.isoformat()}", meta_style))

    total = sum(projection.values())
    story.append(Paragraph(f"Total expected inflow (risk-weighted): <b>{_fmt_inr(total)}</b>", body))
    story.append(Spacer(1, 10))

    table_data = [["Window", "Expected Inflow"]]
    for key in ["0-30", "31-60", "61-90", "90+"]:
        table_data.append([BUCKET_LABELS.get(key, key), _fmt_inr(projection.get(key, 0))])
    t = Table(table_data, colWidths=[200, 150])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(t)

    story.append(Paragraph("AI Summary", h2))
    story.append(Paragraph(narrative.get("summary", ""), body))

    risks = narrative.get("risks") or []
    if risks:
        story.append(Paragraph("Risks", h2))
        for r in risks:
            story.append(Paragraph(f"&bull; {r}", bullet))

    recs = narrative.get("recommendations") or []
    if recs:
        story.append(Paragraph("Recommendations", h2))
        for r in recs:
            story.append(Paragraph(f"&bull; {r}", bullet))

    doc.build(story)
    buffer.seek(0)
    return buffer