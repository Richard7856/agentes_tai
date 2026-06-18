FROM python:3.11-slim

WORKDIR /srv

# Contrato compartido primero (cambia poco → mejor cache de capas).
COPY libs/core /srv/libs/core
RUN pip install --no-cache-dir /srv/libs/core

COPY services/llm-gateway/requirements.txt /srv/requirements.txt
RUN pip install --no-cache-dir -r /srv/requirements.txt

COPY services/llm-gateway/app /srv/app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
