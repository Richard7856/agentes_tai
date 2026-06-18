FROM python:3.11-slim
WORKDIR /srv
COPY libs/core /srv/libs/core
RUN pip install --no-cache-dir /srv/libs/core
COPY services/agents/control-acuerdos/app /srv/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
