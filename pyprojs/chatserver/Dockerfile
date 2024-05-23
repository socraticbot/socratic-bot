# Use an official Python runtime as a parent image
FROM python:3.12-slim

ARG SOCRATIC_CHATSERVER_TOKEN="51454e50-57fc-4d3b-9fc0-d92f1912799f"

# Set environment variables to reduce Python buffering and enable Python unbuffered mode
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev libc6-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install poetry

# Copy the project files into the container
COPY . /socratic/

# Set the working directory in the container
WORKDIR /socratic/pyprojs/chatserver

# Install dependencies using poetry
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# Expose port 8000 to access the application
EXPOSE 8000

# Run the application using uvicorn
CMD ["poetry", "run", "python", "-m", "socratic.chatserver"]
