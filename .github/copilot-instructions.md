# Copilot Instructions for BabyPlay

## Project Overview

BabyPlay is a baby-proof video player PWA for iPad. Users select videos from a tile grid, then playback begins with all touch interactions blocked so babies can't accidentally change videos.

## Architecture

**Single-page app with no build step:**
- `index.html` - Entry point with tile view and player container
- `js/player.js` - `BabyPlayer` class handles all logic (selection, playback, fullscreen, touch blocking)
- `css/style.css` - Styles for tile grid, player, and touch blocker overlay
- `videos.json` - Video playlist configuration (URLs, thumbnails, titles, weights)

**Video hosting strategy:**
- Videos are stored in `media/` but served via GitHub raw URLs (e.g., `https://raw.githubusercontent.com/tsvayer/babyplay/main/media/...`)
- This is required because Cloudflare Pages has a 25MB file limit
- Thumbnails are small enough to deploy directly

**Key components in player.js:**
- `BabyPlayer.selectedVideos` - Array tracking user's tile selections in order
- `BabyPlayer.playQueue` - Current playlist being played
- `#touch-blocker` - Transparent overlay that captures/blocks all touch events during playback

## Deployment

Deploy to Cloudflare Pages (direct upload, no git integration):

```bash
# Create temp folder with web assets only (exclude large video files)
mkdir -p /tmp/deploy/media/thumbnails
cp index.html videos.json manifest.json /tmp/deploy/
cp -r css js /tmp/deploy/
cp media/thumbnails/*.jpg /tmp/deploy/media/thumbnails/

# Deploy
npx wrangler pages deploy /tmp/deploy --project-name=babyplay
```

## Adding New Videos

### Step 1 — Download with yt-dlp

Use 480p max (suitable for mini iPad), output with YouTube ID as filename to avoid collisions:

```bash
cd media/
yt-dlp --no-playlist --merge-output-format mp4 \
  --output "%(id)s.%(ext)s" \
  -f "bestvideo[height<=480][vcodec^=avc][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480][vcodec^=avc]+bestaudio/bestvideo[height<=480]+bestaudio/best[height<=480]/best" \
  "https://youtu.be/VIDEO_ID"
```

**IMPORTANT:** Always use `[vcodec^=avc]` to force H.264 video. AV1 is not supported on older iPads and causes videos to play without sound.

To find episode IDs before downloading:
```bash
yt-dlp --no-playlist --print "%(id)s %(duration)s %(title)s" "ytsearch5:Название мультфильма серия"
```

### Step 2 — Rename to short clean name

```bash
mv "VIDEO_ID.mp4" "Короткое название.mp4"
```

For files already tracked by git (e.g. renaming existing videos), use `git mv` so git tracks the rename and doesn't re-upload the binary:
```bash
git mv "media/Старое название.mp4" "media/Новое название.mp4"
git mv "media/thumbnails/Старое название.jpg" "media/thumbnails/Новое название.jpg"
```

### Step 3 — Generate thumbnail

```bash
./scripts/generate-thumbnails.sh   # generates thumbnails for any .mp4 without one
```

### Step 4 — Add to videos.json

Use Python to append entries (handles URL-encoding correctly):

```python
import json
from urllib.parse import quote

BASE = "https://raw.githubusercontent.com/tsvayer/babyplay/main/media/"

def entry(filename, title, weight=1):
    base = filename.replace(".mp4", "")
    return {
        "url": BASE + quote(filename),
        "thumbnail": f"media/thumbnails/{base}.jpg",
        "title": title,
        "weight": weight
    }

with open("videos.json") as f:
    data = json.load(f)

data["videos"].append(entry("Новый мультфильм.mp4", "Новый мультфильм"))

with open("videos.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

### Step 5 — Commit, push, deploy

```bash
git add media/ videos.json
git commit -m "Add <title>"
git push origin main

# Deploy (web assets only, no video files — they're served from GitHub)
mkdir -p /tmp/deploy/media/thumbnails
cp index.html videos.json manifest.json /tmp/deploy/
cp -r css js /tmp/deploy/
cp media/thumbnails/*.jpg /tmp/deploy/media/thumbnails/
npx wrangler pages deploy /tmp/deploy --project-name=babyplay
```

## Conventions

- **Short Cyrillic filenames** — keep filenames short and clean (e.g. `Кот Леопольд 1.mp4`, not the full YouTube title)
- Video filenames are URL-encoded in `videos.json` for GitHub raw URLs — use `urllib.parse.quote` in Python
- Thumbnails use the same base filename as the video but with `.jpg` extension
- The `weight` field affects shuffle probability in "Play All" mode
- Never commit `.part` or `.ytdl` files — clean up before committing: `rm -f media/*.part media/*.ytdl`
- Videos are NOT committed to Cloudflare Pages (too large) — only thumbnails and web assets are deployed there; videos are served from GitHub raw URLs
