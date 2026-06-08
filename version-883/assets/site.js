(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function initPageFilter() {
    var input = document.querySelector(".page-filter-input");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-card]"),
    );
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.textContent,
        ]
          .join(" ")
          .toLowerCase();
        card.classList.toggle(
          "hidden-card",
          value && text.indexOf(value) === -1,
        );
      });
    });
  }

  function initSearchPage() {
    var input = document.getElementById("search-page-input");
    var results = document.getElementById("search-results");
    if (!input || !results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function movieCard(movie) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' +
          movie.url +
          '" aria-label="' +
          escapeHtml(movie.title) +
          '">',
        '<img src="' +
          movie.cover +
          '" alt="' +
          escapeHtml(movie.title) +
          '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="region-badge">' + escapeHtml(movie.region) + "</span>",
        '<span class="poster-play">▶</span>',
        "</a>",
        '<div class="movie-card-body">',
        '<h3><a href="' +
          movie.url +
          '">' +
          escapeHtml(movie.title) +
          "</a></h3>",
        "<p>" + escapeHtml(movie.oneLine) + "</p>",
        '<div class="movie-meta"><span>' +
          escapeHtml(movie.year) +
          "</span><span>" +
          escapeHtml(movie.type) +
          "</span></div>",
        '<div class="tag-row"><span>' +
          escapeHtml(movie.genre) +
          "</span></div>",
        "</div>",
        "</article>",
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[char];
      });
    }

    function runSearch() {
      var query = input.value.trim().toLowerCase();
      var source = window.SITE_MOVIES;
      var found = source
        .filter(function (movie) {
          if (!query) {
            return movie.hot;
          }
          return (
            [
              movie.title,
              movie.region,
              movie.year,
              movie.type,
              movie.genre,
              movie.tags,
              movie.oneLine,
            ]
              .join(" ")
              .toLowerCase()
              .indexOf(query) !== -1
          );
        })
        .slice(0, 80);
      results.innerHTML = found.length
        ? found.map(movieCard).join("")
        : '<div class="empty-results">没有找到匹配内容</div>';
    }

    input.addEventListener("input", runSearch);
    runSearch();
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("play-button");
    var url = window.PLAYER_VIDEO_URL;
    if (!video || !button || !url) {
      return;
    }
    var loaded = false;

    function attachVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      attachVideo();
      button.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
  }

  ready(function () {
    initNav();
    initHero();
    initPageFilter();
    initSearchPage();
    initPlayer();
  });
})();
