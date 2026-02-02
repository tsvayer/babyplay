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

1. Download video to `media/` folder
2. Run `./scripts/generate-thumbnails.sh` (requires ffmpeg)
3. Add entry to `videos.json` with GitHub raw URL for the video:
   ```json
   {
     "url": "https://raw.githubusercontent.com/tsvayer/babyplay/main/media/<url-encoded-filename>.mp4",
     "thumbnail": "media/thumbnails/<filename>.jpg",
     "title": "Display Title",
     "weight": 1
   }
   ```
4. Commit and push (so GitHub raw URLs work)
5. Redeploy to Cloudflare Pages

## Conventions

- Video filenames often contain Cyrillic and special characters - must be URL-encoded in `videos.json` for GitHub raw URLs
- Thumbnails use the same base filename as videos but with `.jpg` extension
- The `weight` field affects shuffle probability in "Play All" mode
