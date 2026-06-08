(function () {
  var input = document.getElementById('searchInput');
  var typeFilter = document.getElementById('typeFilter');
  var regionFilter = document.getElementById('regionFilter');
  var yearFilter = document.getElementById('yearFilter');
  var results = document.getElementById('searchResults');
  var empty = document.getElementById('searchEmpty');
  var data = window.MOVIES_DATA || [];
  var params = new URLSearchParams(window.location.search);

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function includesText(movie, query) {
    if (!query) {
      return true;
    }
    return movie.search.indexOf(query) !== -1;
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-card>' +
      '<a class="poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
        '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
      '</a>' +
      '<div class="movie-info">' +
        '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
        '<p class="movie-line">' + escapeHtml(movie.one_line) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

  function render() {
    var query = (input.value || '').trim().toLowerCase();
    var typeValue = typeFilter.value;
    var regionValue = regionFilter.value;
    var yearValue = yearFilter.value;
    var hasFilter = query || typeValue || regionValue || yearValue;
    var matched = data.filter(function (movie) {
      return includesText(movie, query) &&
        (!typeValue || movie.type === typeValue) &&
        (!regionValue || movie.region === regionValue) &&
        (!yearValue || movie.year === yearValue);
    });
    if (!hasFilter) {
      matched = matched.slice(0, 120);
    }
    results.innerHTML = matched.map(card).join('');
    results.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
      });
    });
    empty.classList.toggle('is-visible', matched.length === 0);
  }

  if (params.get('q')) {
    input.value = params.get('q');
  }

  [input, typeFilter, regionFilter, yearFilter].forEach(function (element) {
    element.addEventListener('input', render);
    element.addEventListener('change', render);
  });
  render();
}());
