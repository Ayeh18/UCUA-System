import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """Configure root logging once, in a format that works for both humans and log collectors."""
    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
        stream=sys.stdout,
        force=True,
    )
