# CLI reference (`scripts/image_gen.py`) for favicon-generator

This reference is intentionally favicon/PWA-icon focused.

## Resolve CLI path first

```bash
if [ -f ".agents/skills/favicon-generator/scripts/image_gen.py" ]; then
  ICON_CLI=".agents/skills/favicon-generator/scripts/image_gen.py"
elif [ -f "$HOME/.agents/skills/favicon-generator/scripts/image_gen.py" ]; then
  ICON_CLI="$HOME/.agents/skills/favicon-generator/scripts/image_gen.py"
else
  echo "favicon-generator CLI not found" >&2
  exit 1
fi
```

## Env loading

The CLI auto-loads `.env.local` and `.env` from the current working directory, then checks `OPENAI_API_KEY`.

Never print `.env.local` contents or key substrings.

## Sanity check (no API call)

```bash
python3 "$ICON_CLI" generate --prompt "test icon" --dry-run
```

## Generate master icon (live API call)

```bash
mkdir -p tmp/favicon-generator
python3 "$ICON_CLI" generate --prompt "minimal geometric app icon, bold contrast, no text" --size 1024x1024 --quality high --output-format png --out tmp/favicon-generator/app-icon-master.png --use-case logo-brand --constraints "single centered app icon mark, no text, no watermark, high contrast, clean shape language" --force
```

## DNS precheck

```bash
python3 - <<'PY'
import socket
socket.gethostbyname("api.openai.com")
print("DNS ok: api.openai.com")
PY
```

## Export full PWA icon pack (macOS)

```bash
mkdir -p public tmp/favicon-generator
cp tmp/favicon-generator/app-icon-master.png public/icon-512x512.png
sips -s format png public/icon-512x512.png --resampleHeightWidth 192 192 --out public/icon-192x192.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 180 180 --out public/apple-touch-icon.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 72 72 --out public/badge-72x72.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 512 512 --out public/icon-maskable-512x512.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 192 192 --out public/icon-maskable-192x192.png >/dev/null
python3 - <<'PY'
from PIL import Image
img = Image.open("public/icon-512x512.png").convert("RGBA")
img.save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("Wrote app/favicon.ico")
PY
```

## Export from existing source image

```bash
SOURCE="path/to/source-icon.png"
mkdir -p public
cp "$SOURCE" public/icon-512x512.png
sips -s format png public/icon-512x512.png --resampleHeightWidth 192 192 --out public/icon-192x192.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 180 180 --out public/apple-touch-icon.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 72 72 --out public/badge-72x72.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 512 512 --out public/icon-maskable-512x512.png >/dev/null
sips -s format png public/icon-512x512.png --resampleHeightWidth 192 192 --out public/icon-maskable-192x192.png >/dev/null
python3 - <<'PY'
from PIL import Image
img = Image.open("public/icon-512x512.png").convert("RGBA")
img.save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("Wrote app/favicon.ico")
PY
```

## Dependency check

```bash
python3 - <<'PY'
import importlib.util
print('openai', bool(importlib.util.find_spec('openai')))
print('PIL', bool(importlib.util.find_spec('PIL')))
PY
```

Install deps if needed:

```bash
python3 -m pip install --user openai pillow
```

If system Python is externally managed (PEP-668), create a local venv and install there.

## Failure policy

- If the live generate step fails due to DNS/network/API connection, stop after that attempt.
- Report blocker and give the exact command to rerun in a network-enabled shell.
- If user has a source image, switch to export-only workflow immediately.
- If `sips` returns `Error 13` during ICO conversion, keep PNG exports and generate `app/favicon.ico` with Pillow.
