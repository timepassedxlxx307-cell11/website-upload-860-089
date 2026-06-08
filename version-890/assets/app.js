(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    filterInputs.forEach(function (input) {
      if (initialQuery && !input.value) {
        input.value = initialQuery;
      }
    });

    var filterControls = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input], [data-year-filter], [data-type-filter], [data-region-filter]"));
    var filterCards = function () {
      var queryInput = document.querySelector("[data-filter-input]");
      var yearSelect = document.querySelector("[data-year-filter]");
      var typeSelect = document.querySelector("[data-type-filter]");
      var regionSelect = document.querySelector("[data-region-filter]");
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-keywords") || "").toLowerCase();
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      var empty = document.querySelector("[data-empty-state]");
      if (empty) {
        empty.classList.toggle("is-visible", cards.length > 0 && visible === 0);
      }
    };
    filterControls.forEach(function (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    });
    if (filterControls.length) {
      filterCards();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-play-cover]");
      var triggers = Array.prototype.slice.call(player.querySelectorAll("[data-play-trigger]"));
      var stream = player.getAttribute("data-stream");
      var loaded = false;
      var hlsInstance = null;

      var loadStream = function () {
        if (!video || !stream || loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      };

      var startPlayback = function () {
        if (!video) {
          return;
        }
        loadStream();
        var result = video.play();
        if (result && typeof result.then === "function") {
          result.then(function () {
            if (cover) {
              cover.classList.add("is-hidden");
            }
          }).catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        } else if (cover) {
          cover.classList.add("is-hidden");
        }
      };

      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      });

      if (cover) {
        cover.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayback();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayback();
          }
        });
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
