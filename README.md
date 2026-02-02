# 🎬 BabyPlay

A baby-proof video player for iPad. Plays videos from a weighted random playlist with all touch interactions blocked, so your baby can watch without accidentally changing videos.

## Features

- ✅ **Baby-proof** - All touch interactions blocked (taps, swipes, gestures)
- ✅ **Weighted random** - Favorite videos play more often
- ✅ **Auto-advance** - Automatically plays next video when current one ends
- ✅ **Fullscreen mode** - Hides browser UI for distraction-free viewing
- ✅ **iPad optimized** - Works as a home screen app
- ✅ **Cloud streaming** - Videos stored in Cloudflare R2

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/YOUR_USERNAME/babyplay.git
cd babyplay
```

### 2. Set Up Cloudflare (Free)

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. Go to **R2** → **Create bucket** → Name it `babyplay-videos`
3. In bucket settings, enable **Public access** and copy your public URL (e.g., `https://pub-abc123.r2.dev`)
4. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
5. Select your repository, leave build settings empty (static site)

### 3. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 4. Upload Your Videos

```bash
# Put video files in media/ folder
cp ~/Downloads/baby-shark.mp4 media/
cp ~/Downloads/wheels-on-the-bus.mp4 media/

# Upload to R2
./scripts/upload-videos.sh
```

### 5. Configure Playlist

Edit `videos.json` with your video URLs:

```json
{
  "videos": [
    {
      "url": "https://pub-abc123.r2.dev/baby-shark.mp4",
      "title": "Baby Shark",
      "weight": 3
    },
    {
      "url": "https://pub-abc123.r2.dev/wheels-on-the-bus.mp4",
      "title": "Wheels on the Bus",
      "weight": 2
    }
  ]
}
```

**Weight explanation:** A video with `weight: 3` is 3x more likely to be selected than a video with `weight: 1`.

### 6. Deploy

```bash
git add videos.json
git commit -m "Add videos"
git push
```

Your app will be live at `https://babyplay.pages.dev` (or your custom domain).

## Usage on iPad

### Add to Home Screen (Recommended)

1. Open your BabyPlay URL in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Launch from home screen for fullscreen experience (no Safari UI)

### Using the Player

1. Tap **Start Playing**
2. Tap **Go Fullscreen** for best experience
3. Hand iPad to baby - all touches are blocked!
4. To exit: Swipe up from bottom (iPad) or press Home button

## Project Structure

```
babyplay/
├── index.html          # Main page
├── videos.json         # Your video playlist (edit this!)
├── manifest.json       # Web app manifest
├── wrangler.toml       # Cloudflare config
├── css/
│   └── style.css       # Styles
├── js/
│   └── player.js       # Player logic
├── scripts/
│   └── upload-videos.sh  # Video upload helper
└── media/              # Local videos (gitignored)
```

## Configuration Reference

### videos.json

```json
{
  "videos": [
    {
      "url": "https://...",  // Full URL to video file
      "title": "Name",       // Display name (for logs)
      "weight": 1            // Selection weight (higher = more likely)
    }
  ]
}
```

### wrangler.toml

Update `bucket_name` if you used a different R2 bucket name:

```toml
[[r2_buckets]]
binding = "VIDEOS"
bucket_name = "babyplay-videos"
```

## Deployment Workflow

### Code Changes

```bash
# Edit files...
git add .
git commit -m "Your changes"
git push
# Auto-deploys to Cloudflare Pages in ~30 seconds
```

### Adding New Videos

```bash
# 1. Add video to media/ folder
cp ~/Downloads/new-video.mp4 media/

# 2. Upload to R2
./scripts/upload-videos.sh

# 3. Add URL to videos.json
# 4. Commit and push
git add videos.json
git commit -m "Add new video"
git push
```

## Troubleshooting

### Videos not playing

- Check browser console for errors
- Verify video URLs are correct and publicly accessible
- Ensure CORS is configured (R2 public buckets handle this automatically)

### Autoplay blocked

iOS Safari requires user interaction before playing video with sound. The app handles this by:
1. Requiring a tap to start
2. Falling back to muted playback if needed

### Fullscreen not working

iOS Safari has restrictions on fullscreen. For best results:
- Add to Home Screen and launch from there
- Ensure the fullscreen request happens on user tap

### Upload script fails

1. Check wrangler is installed: `wrangler --version`
2. Check you're logged in: `wrangler whoami`
3. Check bucket exists: `wrangler r2 bucket list`

## R2 Pricing (Generous Free Tier)

- **Storage:** 10 GB free
- **Operations:** 10 million requests/month free
- **Egress:** Free (no bandwidth charges!)

For a baby video player, you'll likely never exceed the free tier.

## License

MIT
