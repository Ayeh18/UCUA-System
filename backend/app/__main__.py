"""Development server: `python -m app` (from the backend/ directory).

Starts uvicorn with auto-reload on HOST:PORT from settings (default 127.0.0.1:8001), which is
where the frontend's Vite proxy expects the API.
"""

import socket
import sys

import uvicorn

from app.core.config import get_settings


def _port_in_use(host: str, port: int) -> bool:
    # On Windows a second server can bind a busy port without error, and requests then reach
    # whichever app the OS picks. Refuse to start instead of silently sharing the port.
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) == 0


def main() -> int:
    settings = get_settings()
    if _port_in_use(settings.host, settings.port):
        print(
            f"Port {settings.port} is already in use by another program.\n"
            f"Stop it, or start on another port with PORT=<number> in backend/.env "
            f"(and VITE_PROXY_TARGET=http://localhost:<number> in frontend/.env.local).",
            file=sys.stderr,
        )
        return 1

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
