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
    Authorization: `Bearer ${API_KEY}`,
  },
};

const heroBanner = `${import.meta.env.BASE_URL}hero.png`;

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

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${currentPage}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&language=en-US&page=${currentPage}`;
      const response = await fetch(endpoint, { ...API_OPTIONS, signal });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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

      console.error(`ERROR FETCHING MOVIES: ${error}`);
      setErrorMessage(`Unable to load movies: ${error.message}`);
      setMovieList([]);
      setTrendingMovies([]);
      setTotalPages(1);
      setTotalResults(0);
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