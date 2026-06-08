
(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    qsa('[data-hero]').forEach(function (hero) {
      var slides = qsa('.hero-slide', hero);
      var copies = qsa('[data-hero-copy]', hero);
      var dots = qsa('[data-hero-dot]', hero);
      var prev = qs('[data-hero-prev]', hero);
      var next = qs('[data-hero-next]', hero);
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        copies.forEach(function (copy, i) {
          copy.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        if (slides.length < 2) {
          return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      show(0);
      start();
    });

    qsa('[data-filter-input]').forEach(function (input) {
      var target = input.getAttribute('data-filter-input') || 'body';
      var scope = qs(target) || document;
      var cards = qsa('[data-movie-card]', scope);
      var empty = qs('[data-search-empty]', scope.parentNode || document);

      function filterCards() {
        var keyword = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            shown += 1;
          }
        });
        if (empty) {
          empty.style.display = shown ? 'none' : 'block';
        }
      }

      input.addEventListener('input', filterCards);
      filterCards();
    });

    var searchForm = qs('[data-search-form]');
    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        var field = qs('input[name="q"]', searchForm);
        if (field && field.value.trim()) {
          return;
        }
        event.preventDefault();
        if (field) {
          field.focus();
        }
      });
    }

    var searchPageInput = qs('[data-search-page-input]');
    if (searchPageInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      searchPageInput.value = q;
      searchPageInput.dispatchEvent(new Event('input'));
    }
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var playButton = document.querySelector('[data-player-play]');
  var overlay = document.querySelector('[data-player-overlay]');
  var status = document.querySelector('[data-player-status]');
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text || '';
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function attachSource() {
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('视频暂时无法播放，请刷新重试');
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      setStatus('视频暂时无法播放，请刷新重试');
    }
  }

  function playVideo() {
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('点击播放按钮继续观看');
      });
    }
  }

  attachSource();

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('playing', hideOverlay);
  video.addEventListener('pause', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
