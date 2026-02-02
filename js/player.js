/**
 * BabyPlay - Baby-proof video player
 * Tile view for video selection, then plays videos with touch interactions blocked
 */

class BabyPlayer {
  constructor() {
    this.videos = [];
    this.selectedVideos = []; // Array of video objects in selection order
    this.playQueue = [];      // Queue of videos to play
    this.currentIndex = 0;
    this.playMode = null;     // 'selected' or 'all'
    
    // DOM elements
    this.video = document.getElementById('video-player');
    this.touchBlocker = document.getElementById('touch-blocker');
    this.tileView = document.getElementById('tile-view');
    this.tileGrid = document.getElementById('tile-grid');
    this.playerContainer = document.getElementById('player-container');
    this.loading = document.getElementById('loading');
    this.playSelectedBtn = document.getElementById('play-selected-btn');
    this.playAllBtn = document.getElementById('play-all-btn');
    
    this.init();
  }

  async init() {
    await this.loadVideos();
    this.renderTileView();
    this.setupEventListeners();
    this.setupTouchBlocking();
  }

  async loadVideos() {
    try {
      const response = await fetch('videos.json');
      const data = await response.json();
      this.videos = data.videos;
      console.log(`Loaded ${this.videos.length} videos`);
    } catch (error) {
      console.error('Failed to load videos.json:', error);
      this.videos = [];
    }
  }

  renderTileView() {
    this.tileGrid.innerHTML = '';
    
    this.videos.forEach((video, index) => {
      const tile = document.createElement('div');
      tile.className = 'video-tile';
      tile.dataset.index = index;
      
      tile.innerHTML = `
        <img class="tile-thumbnail" src="${video.thumbnail || ''}" alt="${video.title}" onerror="this.style.display='none'">
        <div class="tile-title">${video.title}</div>
        <div class="selection-badge"></div>
      `;
      
      tile.addEventListener('click', () => this.toggleSelection(index));
      this.tileGrid.appendChild(tile);
    });
  }

  toggleSelection(index) {
    const video = this.videos[index];
    const tile = this.tileGrid.querySelector(`[data-index="${index}"]`);
    const existingIndex = this.selectedVideos.findIndex(v => v === video);
    
    if (existingIndex >= 0) {
      // Deselect
      this.selectedVideos.splice(existingIndex, 1);
      tile.classList.remove('selected');
    } else {
      // Select
      this.selectedVideos.push(video);
      tile.classList.add('selected');
    }
    
    this.updateSelectionBadges();
    this.updatePlayButton();
  }

  updateSelectionBadges() {
    // Clear all badges
    this.tileGrid.querySelectorAll('.selection-badge').forEach(badge => {
      badge.textContent = '';
    });
    
    // Update badges with selection order
    this.selectedVideos.forEach((video, selIndex) => {
      const videoIndex = this.videos.indexOf(video);
      const tile = this.tileGrid.querySelector(`[data-index="${videoIndex}"]`);
      if (tile) {
        tile.querySelector('.selection-badge').textContent = selIndex + 1;
      }
    });
  }

  updatePlayButton() {
    const count = this.selectedVideos.length;
    this.playSelectedBtn.textContent = `▶ Play Selected (${count})`;
    this.playSelectedBtn.disabled = count === 0;
  }

  setupEventListeners() {
    // Play buttons
    this.playSelectedBtn.addEventListener('click', () => this.startPlaySelected());
    this.playAllBtn.addEventListener('click', () => this.startPlayAll());
    
    // Video events
    this.video.addEventListener('ended', () => this.onVideoEnded());
    this.video.addEventListener('error', (e) => this.handleVideoError(e));
    this.video.addEventListener('waiting', () => this.showLoading());
    this.video.addEventListener('playing', () => this.hideLoading());
    this.video.addEventListener('canplay', () => this.hideLoading());
    
    // Fullscreen changes
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
  }

  setupTouchBlocking() {
    const blockEvent = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const events = [
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
      'contextmenu', 'gesturestart', 'gesturechange', 'gestureend'
    ];

    events.forEach(event => {
      this.touchBlocker.addEventListener(event, blockEvent, { passive: false });
    });

    document.addEventListener('touchmove', (e) => {
      if (!this.playerContainer.classList.contains('hidden')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  startPlaySelected() {
    if (this.selectedVideos.length === 0) return;
    
    this.playMode = 'selected';
    this.playQueue = [...this.selectedVideos]; // Play in selection order
    this.currentIndex = 0;
    this.startPlayback();
  }

  startPlayAll() {
    if (this.videos.length === 0) {
      alert('No videos configured');
      return;
    }
    
    this.playMode = 'all';
    // Shuffle all videos for "Play All"
    this.playQueue = this.shuffleArray([...this.videos]);
    this.currentIndex = 0;
    this.startPlayback();
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  startPlayback() {
    // Hide tile view, show player
    this.tileView.classList.add('hidden');
    this.playerContainer.classList.remove('hidden');
    
    // Enter fullscreen
    this.enterFullscreen();
    
    // Start first video
    this.playCurrentVideo();
  }

  playCurrentVideo() {
    if (this.currentIndex >= this.playQueue.length) {
      // Playlist finished, return to tile view
      this.returnToTileView();
      return;
    }

    const videoData = this.playQueue[this.currentIndex];
    console.log(`Playing (${this.currentIndex + 1}/${this.playQueue.length}): ${videoData.title}`);
    
    this.showLoading();
    this.video.src = videoData.url;
    
    const playPromise = this.video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Playback started');
          this.hideLoading();
        })
        .catch(error => {
          console.error('Autoplay failed:', error);
          this.video.muted = true;
          this.video.play().catch(e => {
            console.error('Even muted playback failed:', e);
          });
        });
    }
  }

  onVideoEnded() {
    this.currentIndex++;
    this.playCurrentVideo();
  }

  handleVideoError(e) {
    console.error('Video error:', e);
    // Skip to next video after delay
    setTimeout(() => {
      this.currentIndex++;
      this.playCurrentVideo();
    }, 2000);
  }

  returnToTileView() {
    // Exit fullscreen
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    
    // Stop video
    this.video.pause();
    this.video.src = '';
    
    // Show tile view, hide player
    this.playerContainer.classList.add('hidden');
    this.tileView.classList.remove('hidden');
    
    // Clear selection
    this.selectedVideos = [];
    this.tileGrid.querySelectorAll('.video-tile').forEach(tile => {
      tile.classList.remove('selected');
    });
    this.updateSelectionBadges();
    this.updatePlayButton();
  }

  showLoading() {
    this.loading.classList.remove('hidden');
  }

  hideLoading() {
    this.loading.classList.add('hidden');
  }

  enterFullscreen() {
    const container = this.playerContainer;
    
    if (container.requestFullscreen) {
      container.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }
  }

  onFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    console.log('Fullscreen changed:', isFullscreen ? 'entered' : 'exited');
  }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.babyPlayer = new BabyPlayer();
});
