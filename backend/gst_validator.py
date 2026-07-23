import re

GSTIN_REGEX = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$'

VALID_RATES = [0, 3, 5, 12, 18, 28]


def validate_invoice(invoice):

    taxable = float(invoice.get("taxable_amount", 0))
    gst_rate = float(invoice.get("gst_rate", 0))
    gst_amount = float(invoice.get("gst_amount", 0))
    total = float(invoice.get("total", 0))
    gstin = invoice.get("gstin", "")
    cgst = float(invoice.get("cgst", 0))
    sgst = float(invoice.get("sgst", 0))
    igst = float(invoice.get("igst", 0))

    result = {}

    # GSTIN
    result["gstin_valid"] = bool(re.match(GSTIN_REGEX, gstin))

    # GST Rate
    result["gst_rate_valid"] = gst_rate in VALID_RATES

    # Expected GST
    expected_gst = round(taxable * gst_rate / 100, 2)

    result["expected_gst"] = expected_gst
    result["gst_valid"] = abs(expected_gst - gst_amount) <= 1

    # Expected Total
    expected_total = round(taxable + gst_amount, 2)

    result["expected_total"] = expected_total
    result["total_valid"] = abs(expected_total - total) <= 1

    # Tax Split
    if igst > 0:

        result["tax_type"] = "IGST"

        result["split_valid"] = abs(igst - gst_amount) <= 1

    else:

        result["tax_type"] = "CGST+SGST"

        result["split_valid"] = (
            abs((cgst + sgst) - gst_amount) <= 1
        )

    score = 100

    if not result["gstin_valid"]:
        score -= 20

    if not result["gst_rate_valid"]:
        score -= 20

    if not result["gst_valid"]:
        score -= 25

    if not result["total_valid"]:
        score -= 20

    if not result["split_valid"]:
        score -= 15

    result["health_score"] = max(score, 0)

    return result