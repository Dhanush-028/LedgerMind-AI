import cv2
import numpy as np
import tempfile

def preprocess_invoice_image(file_bytes: bytes) -> bytes:
    # Convert raw bytes → numpy array
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    # Binarize (black/white) to remove background noise
    _, img = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY)

    # Deskew (fix tilted scans)
    coords = cv2.findNonZero(img)
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = img.shape[:2]
    M = cv2.getRotationMatrix2D((w//2, h//2), angle, 1.0)
    img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Save to temp file and reload as bytes
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, img)
        with open(tmp.name, "rb") as f:
            processed_bytes = f.read()

    return processed_bytes
