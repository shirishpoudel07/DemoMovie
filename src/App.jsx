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

  const fetchMovies = async (query, signal) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&language=en-US&page=1`;
      const response = await fetch(endpoint, { ...API_OPTIONS, signal });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.status_message || `TMDB request failed (${response.status})`);
      }

      const data = await response.json();
      setMovieList(data.results || []);

      if (query) {
        setTrendingMovies(
          [...(data.results || [])]
            .sort((firstMovie, secondMovie) => secondMovie.popularity - firstMovie.popularity)
            .slice(0, 6),
        );
      } else {
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
      fetchMovies(query, controller.signal);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

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
              setSearchTerm={setSearchTerm}
              isLoading={isLoading}
            />
         </header>

          <Trending
            movies={trendingMovies}
            title={searchTerm.trim() ? 'Because you searched' : 'Trending this week'}
            onSelect={setSearchTerm}
          />

          <section
            className={`all-movies ${isLoading && movieList.length ? 'is-refreshing' : ''}`}
            aria-busy={isLoading}
          >
            <div className="section-heading">
              <h2>All Movies</h2>
              {!isLoading && !errorMessage && movieList.length > 0 && (
                <span>{movieList.length} films</span>
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
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;