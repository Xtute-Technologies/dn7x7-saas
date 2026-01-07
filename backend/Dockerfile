FROM python:3.10-slim

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies (needed for MySQL/Postgres drivers)
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Install production server
RUN pip install gunicorn uvicorn

# Copy project files
COPY . .

# Create directories for static and media files
RUN mkdir -p /app/staticfiles /app/media

# Create a non-root user (good practice)
# We use UID 1000 to match standard linux users for easier volume permission handling
RUN addgroup --system --gid 1000 django \
    && adduser --system --uid 1000 --gid 1000 django

# Give ownership of app directory to django user
RUN chown -R django:django /app

# Switch to non-root user
USER django

# Expose port 8100
EXPOSE 8100

# Run Gunicorn on port 8100
CMD ["gunicorn", "--bind", "0.0.0.0:8100", "--workers", "3", "dn7x7saas.wsgi:application"]