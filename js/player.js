/**
 * BabyPlay - Baby-proof video player
 * Plays videos from a weighted random playlist with all touch interactions blocked
 */

class BabyPlayer {
  constructor() {
    this.videos = [];
    this.currentVideo = null;
    this.video = document.getElementById('video-player');
    this.touchBlocker = document.getElementById('touch-blocker');
    this.startScreen = document.getElementById('start-screen');
    this.playerContainer = document.getElementById('player-container');
    this.fullscreenButton = document.getElementById('fullscreen-button');
    this.loading = document.getElementById('loading');
    this.startButton = document.getElementById('start-button');
    
    this.init();
  }

  async init() {
    // Load video configuration
    await this.loadVideos();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up touch blocking
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
      // Fallback to empty array - will show error state
      this.videos = [];
    }
  }

  setupEventListeners() {
    // Start button
    this.startButton.addEventListener('click', () => this.start());
    
    // Video events
    this.video.addEventListener('ended', () => this.playNextVideo());
    this.video.addEventListener('error', (e) => this.handleVideoError(e));
    this.video.addEventListener('waiting', () => this.showLoading());
    this.video.addEventListener('playing', () => this.hideLoading());
    this.video.addEventListener('canplay', () => this.hideLoading());
    
    // Fullscreen button
    this.fullscreenButton.addEventListener('click', () => this.enterFullscreen());
    
    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
  }

  setupTouchBlocking() {
    // Block ALL touch events on the overlay
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

    // Also prevent default on document for extra safety when in player mode
    document.addEventListener('touchmove', (e) => {
      if (!this.playerContainer.classList.contains('hidden')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  start() {
    if (this.videos.length === 0) {
      alert('No videos configured. Please add videos to videos.json');
      return;
    }

    // Hide start screen, show player
    this.startScreen.classList.add('hidden');
    this.playerContainer.classList.remove('hidden');
    
    // Show fullscreen button
    this.fullscreenButton.classList.remove('hidden');
    
    // Start playing
    this.playNextVideo();
  }

  /**
   * Weighted random selection algorithm
   * Videos with higher weights are more likely to be selected
   */
  selectRandomVideo() {
    if (this.videos.length === 0) return null;
    if (this.videos.length === 1) return this.videos[0];

    const totalWeight = this.videos.reduce((sum, v) => sum + (v.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const video of this.videos) {
      random -= (video.weight || 1);
      if (random <= 0) {
        return video;
      }
    }

    // Fallback to last video
    return this.videos[this.videos.length - 1];
  }

  playNextVideo() {
    // Select a random video (different from current if possible)
    let nextVideo = this.selectRandomVideo();
    
    // Try to avoid playing the same video twice in a row (if we have multiple videos)
    if (this.videos.length > 1 && this.currentVideo && nextVideo.url === this.currentVideo.url) {
      // Try up to 3 times to get a different video
      for (let i = 0; i < 3; i++) {
        nextVideo = this.selectRandomVideo();
        if (nextVideo.url !== this.currentVideo.url) break;
      }
    }

    this.currentVideo = nextVideo;
    this.playVideo(nextVideo);
  }

  playVideo(videoData) {
    console.log(`Playing: ${videoData.title || videoData.url}`);
    
    this.showLoading();
    this.video.src = videoData.url;
    
    // Attempt to play
    const playPromise = this.video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Playback started');
          this.hideLoading();
        })
        .catch(error => {
          console.error('Autoplay failed:', error);
          // On iOS, autoplay with sound requires user interaction
          // The video will be muted and we'll show a message
          this.video.muted = true;
          this.video.play().catch(e => {
            console.error('Even muted playback failed:', e);
          });
        });
    }
  }

  handleVideoError(e) {
    console.error('Video error:', e);
    // Skip to next video after a short delay
    setTimeout(() => this.playNextVideo(), 2000);
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
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      // Safari/iOS
      container.webkitRequestFullscreen();
    } else if (this.video.webkitEnterFullscreen) {
      // iOS video-specific fullscreen
      this.video.webkitEnterFullscreen();
    }
  }

  onFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    
    if (isFullscreen) {
      // Hide fullscreen button when in fullscreen
      this.fullscreenButton.classList.add('hidden');
    } else {
      // Show fullscreen button when exiting fullscreen
      // This gives parent a chance to re-enter fullscreen
      this.fullscreenButton.classList.remove('hidden');
    }
  }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.babyPlayer = new BabyPlayer();
});
