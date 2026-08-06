import re

GSTIN_REGEX = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$'
VALID_RATES = [0, 3, 5, 12, 18, 28]


def validate_invoice(invoice):

    taxable = float(invoice.get("taxable_amount", 0))
    gst_rate = float(invoice.get("gst_rate", 18))
    gst_amount = float(invoice.get("gst_amount", 0))
    total = float(invoice.get("total", 0))
    gstin = str(invoice.get("gstin", "")).strip().upper()

    cgst = float(invoice.get("cgst", 0))
    sgst = float(invoice.get("sgst", 0))
    igst = float(invoice.get("igst", 0))

    result = {}
    errors = []

    # ---------------- GSTIN ----------------

    result["gstin_valid"] = bool(re.match(GSTIN_REGEX, gstin))

    if not result["gstin_valid"]:
        errors.append("Invalid GSTIN")

    # ---------------- GST RATE ----------------

    result["gst_rate_valid"] = gst_rate in VALID_RATES

    if not result["gst_rate_valid"]:
        errors.append("Invalid GST Rate")

    # ---------------- GST ----------------

    # If GST rate missing, infer it from CGST + SGST
    if gst_rate == 0:
        if cgst > 0 and sgst > 0:
            gst_rate = 18
        elif igst > 0:
            gst_rate = 18

    expected_gst = round(taxable * gst_rate / 100, 2)

    result["expected_gst"] = expected_gst
    result["detected_gst"] = gst_amount

    result["gst_valid"] = abs(expected_gst - gst_amount) <= 1

    if not result["gst_valid"]:
        errors.append(
            f"GST mismatch (Expected ₹{expected_gst:.2f}, Found ₹{gst_amount:.2f})"
        )

    # ---------------- TOTAL ----------------

    expected_total = round(taxable + expected_gst, 2)

    result["expected_total"] = expected_total
    result["detected_total"] = total

    result["total_valid"] = abs(expected_total - total) <= 1

    if not result["total_valid"]:
        errors.append(
            f"Invoice Total mismatch (Expected ₹{expected_total:.2f}, Found ₹{total:.2f})"
        )

    # ---------------- TAX SPLIT ----------------

    if igst > 0:

        result["tax_type"] = "IGST"

        result["split_valid"] = abs(igst - gst_amount) <= 1

    else:

        result["tax_type"] = "CGST + SGST"

        result["split_valid"] = abs((cgst + sgst) - gst_amount) <= 1

    if not result["split_valid"]:
        errors.append("CGST / SGST Split Incorrect")

    # ---------------- HEALTH SCORE ----------------

    score = 100

    if not result["gstin_valid"]:
        score -= 20

    if not result["gst_rate_valid"]:
        score -= 15

    if not result["gst_valid"]:
        score -= 30

    if not result["total_valid"]:
        score -= 20

    if not result["split_valid"]:
        score -= 15

    score = max(score, 0)

    result["health_score"] = score

    # ---------------- FINAL STATUS ----------------

    result["errors"] = errors
    result["is_valid"] = len(errors) == 0

    if result["is_valid"]:
        result["status"] = "Valid Invoice"
    else:
        result["status"] = "Invalid Invoice"

    return result