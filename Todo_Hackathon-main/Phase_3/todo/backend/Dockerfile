FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face uses port 7860 by default
EXPOSE 7860

# Use PORT environment variable if available (for flexibility), otherwise default to 7860
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-7860}