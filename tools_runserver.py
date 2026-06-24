"""E2E server launcher: the server process opens its OWN log file and points
Python's sys.stdout/sys.stderr at it. werkzeug logs via the Python-level
sys.stderr, so a self-owned handle can't break when a parent/stub process exits
(which was killing the dev server mid-run)."""
import os
import sys
import runpy

_here = os.path.dirname(os.path.abspath(__file__))
_log = open(os.path.join(_here, "e2e_server.log"), "a", buffering=1, encoding="utf-8", errors="replace")
sys.stdout = _log
sys.stderr = _log

runpy.run_path(os.path.join(_here, "app.py"), run_name="__main__")
