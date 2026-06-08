(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var selected = filterSelect ? filterSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedSelect = !selected || text.indexOf(selected.toLowerCase()) !== -1;
      var matched = matchedQuery && matchedSelect;

      card.classList.toggle('is-hidden-card', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-active', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && filterInput) {
    filterInput.value = q;
    applyFilter();
  }

  var player = document.querySelector('[data-stream-url]');

  if (player) {
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');
    var message = player.querySelector('[data-player-message]');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-play-button]'));
    var streamUrl = player.getAttribute('data-stream-url');
    var hls;
    var isReady = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function beginPlay() {
      if (!video || !streamUrl) {
        setMessage('播放遇到问题，请稍后再试');
        return;
      }

      if (isReady) {
        video.play().catch(function () {
          setMessage('轻触视频画面继续播放');
        });
        if (layer) {
          layer.classList.add('is-hidden');
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          isReady = true;
          video.play().then(function () {
            if (layer) {
              layer.classList.add('is-hidden');
            }
            setMessage('正在播放');
          }).catch(function () {
            setMessage('轻触视频画面继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setMessage('播放遇到问题，请稍后再试');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
          isReady = true;
          video.play().then(function () {
            if (layer) {
              layer.classList.add('is-hidden');
            }
            setMessage('正在播放');
          }).catch(function () {
            setMessage('轻触视频画面继续播放');
          });
        }, { once: true });
      } else {
        setMessage('播放遇到问题，请稍后再试');
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', beginPlay);
    });

    video.addEventListener('click', beginPlay);
    video.addEventListener('pause', function () {
      if (layer && video.currentTime === 0) {
        layer.classList.remove('is-hidden');
      }
    });
  }
})();
