# 🎬 BabyPlay

A baby-proof video player for iPad. Plays videos randomly with all touch interactions blocked, so your baby can watch without accidentally changing videos.

**Live at: https://babyplay.pages.dev**

## Features

- ✅ **Baby-proof** - All touch interactions blocked (taps, swipes, gestures)
- ✅ **Auto-fullscreen** - Enters fullscreen immediately on start
- ✅ **Weighted random** - Configure favorite videos to play more often
- ✅ **Auto-advance** - Automatically plays next video when current one ends
- ✅ **iPad optimized** - Works as a home screen app

## Usage

1. Open https://babyplay.pages.dev on iPad Safari
2. Tap **"Start Playing (Fullscreen)"**
3. Hand iPad to baby - all touches are blocked!
4. To exit: swipe up from bottom or press Home button

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
      "url": "https://example.com/video1.mp4",
      "title": "Video Title",
      "weight": 1
    }
  ]
}
```

**Weight:** Videos with higher weights play more often. A video with `weight: 3` is 3x more likely to be selected than one with `weight: 1`.

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
│   └── style.css   # Styles
├── js/
│   └── player.js   # Player logic
└── media/          # Video files (optional, can use external URLs)
```

## License

MIT
