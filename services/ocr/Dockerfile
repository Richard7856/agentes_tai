FROM python:3.11-slim
WORKDIR /srv
# NOTA Fase posterior: añadir `tesseract-ocr` vía apt y pytesseract/pdf2image.
COPY services/ocr/requirements.txt /srv/requirements.txt
RUN pip install --no-cache-dir -r /srv/requirements.txt
COPY services/ocr/app /srv/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
