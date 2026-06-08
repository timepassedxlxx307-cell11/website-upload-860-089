(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.hasAttribute('hidden') === false;
      if (isOpen) {
        menu.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        menu.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    function createResult(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a class="movie-thumb" href="' + movie.url + '" aria-label="观看' + movie.title + '">',
        '<img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
        '<span class="movie-score">' + movie.score + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<a href="' + movie.url + '" class="movie-title">' + movie.title + '</a>',
        '<p>' + movie.oneLine + '</p>',
        '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span></div>',
        '</div>'
      ].join('');
      return article;
    }

    function renderResults() {
      var keyword = searchInput.value.trim().toLowerCase();
      var source = window.MOVIE_SEARCH_DATA;
      var matched = keyword ? source.filter(function (movie) {
        return movie.title.toLowerCase().indexOf(keyword) > -1 ||
          movie.region.toLowerCase().indexOf(keyword) > -1 ||
          movie.genre.toLowerCase().indexOf(keyword) > -1 ||
          movie.tags.toLowerCase().indexOf(keyword) > -1 ||
          movie.oneLine.toLowerCase().indexOf(keyword) > -1;
      }).slice(0, 60) : source.slice(0, 24);

      searchResults.innerHTML = '';
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '未找到匹配影片，可以尝试更短的片名、类型或地区关键词。';
        searchResults.appendChild(empty);
        return;
      }
      matched.forEach(function (movie) {
        searchResults.appendChild(createResult(movie));
      });
    }

    searchInput.addEventListener('input', renderResults);
    renderResults();
  }
})();
