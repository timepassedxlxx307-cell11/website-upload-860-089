(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var shell = document.querySelector("[data-player-shell]");
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-start]");
    var stream = window.movieStream;
    var hls = null;
    var started = false;

    if (!shell || !video || !stream) {
      return;
    }

    function load() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      shell.classList.add("is-playing");
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        load();
      });
    }

    shell.addEventListener("click", function () {
      if (!started) {
        load();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
