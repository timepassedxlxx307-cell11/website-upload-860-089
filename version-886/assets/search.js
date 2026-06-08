(function () {
  function getQuery() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function createCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<figure><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><figcaption>" + escapeHtml(movie.type) + "</figcaption></figure>" +
      "<div class=\"card-body\"><div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
      "<h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"mini-tags\">" + tags + "</div></div></a>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[ch];
    });
  }

  function render(query) {
    var input = document.querySelector("[data-search-input]");
    var summary = document.querySelector("[data-search-summary]");
    var results = document.querySelector("[data-search-results]");
    if (!results || !summary) return;
    if (input) input.value = query;
    var q = query.trim().toLowerCase();
    var data = window.SEARCH_MOVIES || [];
    var matched = q ? data.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags).join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 96) : data.slice(0, 48);
    summary.textContent = q ? "搜索结果" : "推荐片单";
    results.innerHTML = matched.map(createCard).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render(getQuery());
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-input]");
    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var q = input.value.trim();
        var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
        history.pushState(null, "", url);
        render(q);
      });
    }
    document.querySelectorAll("[data-term]").forEach(function (button) {
      button.addEventListener("click", function () {
        var term = button.getAttribute("data-term") || "";
        if (input) input.value = term;
        history.pushState(null, "", "./search.html?q=" + encodeURIComponent(term));
        render(term);
      });
    });
  });
})();
