import React, { useEffect, useState } from 'react';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import Trending from './components/Trending';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim();

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
  },
};

const heroBanner = `${import.meta.env.BASE_URL}hero.png`;

const DEMO_MOVIES = [
  {
    id: 1,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_date: '2008-07-18',
    original_language: 'en',
    vote_average: 9.0,
    popularity: 95,
  },
  {
    id: 2,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-16',
    original_language: 'en',
    vote_average: 8.4,
    popularity: 88,
  },
  {
    id: 3,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    release_date: '2014-11-07',
    original_language: 'en',
    vote_average: 8.7,
    popularity: 90,
  },
  {
    id: 4,
    title: 'Spider-Man: Into the Spider-Verse',
    poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    release_date: '2018-12-14',
    original_language: 'en',
    vote_average: 8.4,
    popularity: 84,
  },
  {
    id: 5,
    title: 'Dune',
    poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    release_date: '2021-10-22',
    original_language: 'en',
    vote_average: 8.0,
    popularity: 81,
  },
  {
    id: 6,
    title: 'The Batman',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    release_date: '2022-03-04',
    original_language: 'en',
    vote_average: 7.9,
    popularity: 79,
  },
  {
    id: 7,
    title: 'Arrival',
    poster_path: '/x2FJsf1ElAgr63Y3PN5Y9nYw2LZ.jpg',
    release_date: '2016-11-11',
    original_language: 'en',
    vote_average: 7.4,
    popularity: 72,
  },
  {
    id: 8,
    title: 'Blade Runner 2049',
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    release_date: '2017-10-06',
    original_language: 'en',
    vote_average: 7.6,
    popularity: 74,
  },
  {
    id: 9,
    title: 'Everything Everywhere All at Once',
    poster_path: '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    release_date: '2022-03-25',
    original_language: 'en',
    vote_average: 8.0,
    popularity: 80,
  },
  {
    id: 10,
    title: 'Parasite',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    release_date: '2019-05-30',
    original_language: 'ko',
    vote_average: 8.5,
    popularity: 77,
  },
];

const getDemoMovies = (query = '', currentPage = 1) => {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredMovies = normalizedQuery
    ? DEMO_MOVIES.filter((movie) =>
        `${movie.title} ${movie.original_language}`.toLowerCase().includes(normalizedQuery),
      )
    : [...DEMO_MOVIES];

  const pageSize = 6;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + pageSize);

  return {
    results: paginatedMovies,
    total_pages: Math.max(1, Math.ceil(filteredMovies.length / pageSize)),
    total_results: filteredMovies.length,
  };
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchMovies = async (query, currentPage, signal) => {
    setIsLoading(true);
    setErrorMessage('');

    const applyDemoData = () => {
      const demoData = getDemoMovies(query, currentPage);
      setMovieList(demoData.results || []);
      setTotalPages(demoData.total_pages || 1);
      setTotalResults(demoData.total_results || 0);
      setTrendingMovies(
        [...DEMO_MOVIES]
          .sort((firstMovie, secondMovie) => secondMovie.popularity - firstMovie.popularity)
          .slice(0, 6),
      );
    };

    if (!API_KEY) {
      applyDemoData();
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${currentPage}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&language=en-US&page=${currentPage}`;
      const response = await fetch(endpoint, { ...API_OPTIONS, signal });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          throw new Error('TMDB rejected the API key.');
        }

        throw new Error(errorData.status_message || `TMDB request failed (${response.status})`);
      }

      const data = await response.json();
      setMovieList(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
      setTotalResults(data.total_results || 0);

      if (query && currentPage === 1) {
        setTrendingMovies(
          [...(data.results || [])]
            .sort((firstMovie, secondMovie) => secondMovie.popularity - firstMovie.popularity)
            .slice(0, 6),
        );
      } else if (!query && currentPage === 1) {
        const trendingResponse = await fetch(
          `${API_BASE_URL}/trending/movie/week?language=en-US`,
          { ...API_OPTIONS, signal },
        );

        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          setTrendingMovies((trendingData.results || []).slice(0, 6));
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      console.warn('Using demo movie data because the TMDB request failed:', error.message);
      applyDemoData();
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const query = searchTerm.trim();
    const delay = query ? 400 : 0;
    const timeoutId = setTimeout(() => {
      fetchMovies(query, page, controller.signal);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm, page]);

  const handleSearchTermChange = (value) => {
    setPage(1);
    setSearchTerm(value);
  };

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src={heroBanner} alt="Hero Banner" />
            <h1>
              Find <span className="text-gradient">Movie</span> You'll Enjoy Without Hassle
            </h1>

            <Search
              searchTerm={searchTerm}
              setSearchTerm={handleSearchTermChange}
              isLoading={isLoading}
            />
         </header>

          <Trending
            movies={trendingMovies}
            title={searchTerm.trim() ? 'Because you searched' : 'Trending this week'}
            onSelect={handleSearchTermChange}
          />

          <section
            className={`all-movies ${isLoading && movieList.length ? 'is-refreshing' : ''}`}
            aria-busy={isLoading}
          >
            <div className="section-heading">
              <h2>All Movies</h2>
              {!isLoading && !errorMessage && totalResults > 0 && (
                <span>{totalResults.toLocaleString()} films</span>
              )}
            </div>

            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
                ))} 
              </ul>
            )}

            {!isLoading && !errorMessage && movieList.length === 0 && (
              <p className="empty-state">No movies found.</p>
            )}

            {!isLoading && !errorMessage && totalPages > 1 && (
              <nav className="pagination" aria-label="Movie pages">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page === 1}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  <span aria-hidden="true">&#8592;</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                  const firstPage = Math.min(Math.max(page - 2, 1), Math.max(totalPages - 4, 1));
                  const pageNumber = firstPage + index;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      className={pageNumber === page ? 'active' : ''}
                      aria-current={pageNumber === page ? 'page' : undefined}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page === totalPages}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  <span aria-hidden="true">&#8594;</span>
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;