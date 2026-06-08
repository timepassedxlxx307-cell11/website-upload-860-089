(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalise(text) {
    return String(text || "").toLowerCase().trim();
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navPanel = document.querySelector("[data-nav-panel]");

    if (navToggle && navPanel) {
      navToggle.addEventListener("click", function () {
        navPanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      }, { once: true });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        if (slides.length > 1) {
          timer = window.setInterval(function () {
            show(index + 1);
          }, 5200);
        }
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      slider.addEventListener("mouseenter", function () {
        if (timer) {
          window.clearInterval(timer);
        }
      });

      slider.addEventListener("mouseleave", restart);
      show(0);
      start();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var searchInput = document.querySelector("[data-search-page-input]");
    var cardList = document.querySelector("[data-card-list]");
    var clearButton = document.querySelector("[data-filter-clear]");
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilter(query) {
      if (!cardList) {
        return;
      }

      var value = normalise(query);
      var cards = Array.prototype.slice.call(cardList.querySelectorAll("[data-card]"));
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalise(card.getAttribute("data-search"));
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", function () {
        applyFilter(filterInput.value);
      });
    }

    if (clearButton && filterInput) {
      clearButton.addEventListener("click", function () {
        filterInput.value = "";
        applyFilter("");
        filterInput.focus();
      });
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      searchInput.value = query;
      applyFilter(query);
      searchInput.addEventListener("input", function () {
        applyFilter(searchInput.value);
      });
    }
  });
})();
