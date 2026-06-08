(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var list = document.querySelector("[data-card-list]");

    function applyFilter() {
      if (!list) return;
      var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
        card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
      });
    }

    function applySort() {
      if (!list || !sortSelect) return;
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      var mode = sortSelect.value;
      if (mode === "newest" || mode === "oldest") {
        cards.sort(function (a, b) {
          var ay = Number(a.getAttribute("data-year") || 0);
          var by = Number(b.getAttribute("data-year") || 0);
          return mode === "newest" ? by - ay : ay - by;
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      }
      applyFilter();
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", applySort);
    }
  });
})();
