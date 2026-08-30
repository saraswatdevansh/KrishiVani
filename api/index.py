import os
import sys

# Ensure backend directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

for p in [ROOT_DIR, BACKEND_DIR, os.path.join(BACKEND_DIR, "app")]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app

# Export app for Vercel WSGI/ASGI handler
handler = app
