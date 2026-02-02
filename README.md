# 🎬 BabyPlay

A baby-proof video player for iPad. Select videos from a tile view, then play with all touch interactions blocked, so your baby can watch without accidentally changing videos.

**Live at: https://babyplay.pages.dev**

## Features

- ✅ **Tile View Selection** - Browse thumbnails, select videos in order
- ✅ **Play Selected** - Videos play in the order you clicked them
- ✅ **Play All** - Shuffle and play entire library
- ✅ **Baby-proof** - All touch interactions blocked during playback
- ✅ **Auto-fullscreen** - Enters fullscreen immediately on play
- ✅ **Auto-advance** - Automatically plays next video when current one ends
- ✅ **Return to selection** - Returns to tile view when playlist ends
- ✅ **iPad optimized** - Works as a home screen app

## Usage

1. Open https://babyplay.pages.dev on iPad Safari
2. **Select videos** by tapping tiles (numbers show play order)
3. Tap **"Play Selected"** or **"Play All"**
4. Hand iPad to baby - all touches are blocked!
5. To exit: swipe up from bottom or press Home button

### Add to Home Screen (Recommended)

For the best experience without Safari UI:
1. Open the site in Safari
2. Tap **Share** → **Add to Home Screen**
3. Launch from home screen

## Configuration

Edit `videos.json` to customize the playlist:

```json
{
  "videos": [
    {
      "url": "media/video1.mp4",
      "thumbnail": "media/thumbnails/video1.jpg",
      "title": "Video Title",
      "weight": 1
    }
  ]
}
```

- **url:** Path to video file (relative or absolute)
- **thumbnail:** Path to thumbnail image for tile view
- **title:** Display name in tile view
- **weight:** Videos with higher weights play more often in "Play All" mode

### Generating Thumbnails

Use the included script to generate thumbnails for new videos:

```bash
./scripts/generate-thumbnails.sh
```

Requires `ffmpeg`. Extracts a frame at 25% of video duration.

## Deployment

The app is hosted on Cloudflare Pages. To deploy your own:

```bash
# Install wrangler
npm install -g wrangler
wrangler login

# Create project and deploy
wrangler pages project create my-babyplay --production-branch main
wrangler pages deploy . --project-name my-babyplay
```

## Project Structure

```
babyplay/
├── index.html      # Main page
├── videos.json     # Video playlist configuration
├── manifest.json   # Web app manifest (for Add to Home Screen)
├── css/
│   └── style.css   # Styles (tile view, player, buttons)
├── js/
│   └── player.js   # Player logic (selection, playback, fullscreen)
├── scripts/
│   └── generate-thumbnails.sh  # ffmpeg thumbnail generator
└── media/
    ├── *.mp4       # Video files
    └── thumbnails/ # Generated thumbnails
```

## License

MIT
