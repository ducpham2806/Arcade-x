"""Export the current sci-fi runtime, preserving the existing offline output name."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parent
subprocess.run(['node', str(root.parents[1] / 'scripts/export-block-scifi.cjs'), str(root.parent / 'chronicles-shattered-realms-playtest-v2.html')], check=True)
