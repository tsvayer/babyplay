#!/bin/bash
#
# upload-videos.sh - Upload videos from media/ folder to Cloudflare R2
#
# Usage:
#   ./scripts/upload-videos.sh
#
# Prerequisites:
#   1. Install wrangler: npm install -g wrangler
#   2. Login to Cloudflare: wrangler login
#   3. Create R2 bucket: wrangler r2 bucket create babyplay-videos
#   4. Enable public access in Cloudflare dashboard and get your public URL
#   5. Update R2_PUBLIC_URL below with your bucket's public URL
#

set -e

# Configuration - UPDATE THESE VALUES
BUCKET="babyplay-videos"
R2_PUBLIC_URL="https://pub-XXXXX.r2.dev"  # Get this from Cloudflare R2 dashboard after enabling public access

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "  BabyPlay Video Uploader"
echo "======================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: wrangler CLI not found${NC}"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if media folder exists
if [ ! -d "media" ]; then
    echo -e "${RED}Error: media/ folder not found${NC}"
    echo "Create it and add your video files (*.mp4, *.webm)"
    exit 1
fi

# Find video files
VIDEO_FILES=$(find media -maxdepth 1 -type f \( -name "*.mp4" -o -name "*.webm" -o -name "*.mov" \) 2>/dev/null)

if [ -z "$VIDEO_FILES" ]; then
    echo -e "${YELLOW}No video files found in media/ folder${NC}"
    echo "Supported formats: .mp4, .webm, .mov"
    exit 0
fi

echo "Found videos to upload:"
echo "$VIDEO_FILES" | while read -r file; do
    size=$(du -h "$file" | cut -f1)
    echo "  - $(basename "$file") ($size)"
done
echo ""

# Confirm upload
read -p "Upload these videos to R2? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Uploading videos..."
echo ""

UPLOADED_URLS=""

echo "$VIDEO_FILES" | while read -r file; do
    [ -f "$file" ] || continue
    filename=$(basename "$file")
    
    echo -e "${YELLOW}Uploading: $filename${NC}"
    
    if wrangler r2 object put "$BUCKET/$filename" --file="$file"; then
        url="$R2_PUBLIC_URL/$filename"
        echo -e "${GREEN}✓ Uploaded: $url${NC}"
        UPLOADED_URLS="$UPLOADED_URLS\n$url"
    else
        echo -e "${RED}✗ Failed to upload: $filename${NC}"
    fi
    echo ""
done

echo "======================================"
echo -e "${GREEN}Upload complete!${NC}"
echo "======================================"
echo ""
echo "Add these URLs to your videos.json:"
echo ""
echo "Example entry:"
echo '{'
echo '  "url": "'$R2_PUBLIC_URL'/your-video.mp4",'
echo '  "title": "Video Title",'
echo '  "weight": 1'
echo '}'
echo ""
echo "Then commit and push videos.json to deploy."
