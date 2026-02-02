#!/bin/bash
# Generate thumbnails for all videos at 25% duration

MEDIA_DIR="$(dirname "$0")/../media"
THUMB_DIR="$MEDIA_DIR/thumbnails"

mkdir -p "$THUMB_DIR"

for video in "$MEDIA_DIR"/*.mp4; do
    [ -f "$video" ] || continue
    
    filename=$(basename "$video")
    # Create a safe thumbnail name (replace spaces and special chars)
    thumb_name="${filename%.mp4}.jpg"
    thumb_path="$THUMB_DIR/$thumb_name"
    
    if [ -f "$thumb_path" ]; then
        echo "Thumbnail exists: $thumb_name"
        continue
    fi
    
    echo "Processing: $filename"
    
    # Get video duration in seconds
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$video" 2>/dev/null)
    
    if [ -z "$duration" ]; then
        echo "  Could not get duration, using 10 seconds"
        timestamp="10"
    else
        # Calculate 25% of duration
        timestamp=$(echo "$duration * 0.25" | bc)
        echo "  Duration: ${duration}s, capturing at: ${timestamp}s"
    fi
    
    # Extract frame at 25% duration, scale to 480px width
    ffmpeg -y -ss "$timestamp" -i "$video" -vframes 1 -vf "scale=480:-1" -q:v 2 "$thumb_path" 2>/dev/null
    
    if [ -f "$thumb_path" ]; then
        echo "  Created: $thumb_name"
    else
        echo "  FAILED to create thumbnail"
    fi
done

echo ""
echo "Done! Thumbnails in: $THUMB_DIR"
