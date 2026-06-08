(function () {
  function attachPlayer(player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-play-trigger]');
    if (!video || !trigger) {
      return;
    }
    var url = video.getAttribute('data-video-url');
    var prepared = false;

    function prepare() {
      if (prepared || !url) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    }

    function play() {
      prepare();
      player.classList.add('is-playing');
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    trigger.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(attachPlayer);
}());
