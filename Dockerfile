# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY assitant.py .
COPY db.py .

# Create non-root user for security
RUN useradd -m -u 1000 kemet && \
    chown -R kemet:kemet /app

USER kemet

# Health check (optional, checks if process is running)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep -f assitant.py || exit 1

# Run the assistant
CMD ["python", "assitant.py", "dev"]
