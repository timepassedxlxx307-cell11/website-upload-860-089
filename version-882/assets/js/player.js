(function () {
  function initializePlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var status = player.querySelector('.player-status');
    var source = player.getAttribute('data-source');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function bindSource() {
      if (!video || !source) {
        return Promise.reject(new Error('missing video source'));
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.attachMedia(video);
        }
        hlsInstance.loadSource(source);
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    }

    function playVideo() {
      setStatus('正在加载播放源');
      bindSource().then(function () {
        return video.play();
      }).then(function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        setStatus('');
      }).catch(function () {
        setStatus('点击视频区域后继续播放');
      });
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('waiting', function () {
        setStatus('正在缓冲');
      });
      video.addEventListener('canplay', function () {
        setStatus('');
      });
      video.addEventListener('error', function () {
        setStatus('播放源加载失败，请稍后重试');
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(initializePlayer);
})();
