"""ocr — extracción de texto on-premise (ADR-008) — STUB.

Mantiene el contrato del servicio. La integración real con Tesseract/PaddleOCR
se hace en un módulo posterior (requiere paquetes de sistema). Ningún documento
sale a OCR en la nube.
"""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="ocr")


class OCRRequest(BaseModel):
    documento_url: str


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "motor": "stub", "nota": "Tesseract/PaddleOCR pendiente"}


@app.post("/ocr")
async def ocr(req: OCRRequest) -> dict:
    # TODO: pdf2image + pytesseract/paddleocr on-prem.
    return {"texto": "", "documento_url": req.documento_url, "stub": True}
