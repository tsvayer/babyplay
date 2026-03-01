#!/bin/bash
set -e

DEPLOY_DIR=/tmp/babyplay-deploy

# Clean and prepare deploy directory (web assets only, no video files)
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/media/thumbnails"

cp index.html videos.json manifest.json "$DEPLOY_DIR/"
cp -r css js "$DEPLOY_DIR/"
cp media/thumbnails/*.jpg "$DEPLOY_DIR/media/thumbnails/"

# Deploy from outside the git repo to avoid wrangler picking up Cyrillic commit messages
cd "$DEPLOY_DIR"
npx --yes wrangler pages deploy . --project-name=babyplay --commit-dirty=true

rm -rf "$DEPLOY_DIR"
