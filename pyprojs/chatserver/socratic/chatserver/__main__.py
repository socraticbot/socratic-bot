"""Entry for Socratic chat server."""

import dotenv
from uvicorn import run

from .app import app

dotenv.load_dotenv()
run(app, host="0.0.0.0", port=8000)
