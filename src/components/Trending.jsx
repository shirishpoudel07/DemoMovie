import React from 'react';

const Trending = ({ movies, title, onSelect }) => {
  const fallbackPoster = `${import.meta.env.BASE_URL}no-movie.png`;

  if (!movies.length) {
    return null;
  }

  return (
    <section className="trending" aria-labelledby="trending-heading">
      <div className="trending-heading">
        <div>
          <span className="eyebrow">Curated for you</span>
          <h2 id="trending-heading">{title}</h2>
        </div>
        <span className="trending-hint">Tap a poster to explore</span>
      </div>
      <ul>
        {movies.map((movie, index) => {
          const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : fallbackPoster;

          return (
            <li key={movie.id}>
              <button type="button" onClick={() => onSelect(movie.title)}>
                <span className="trending-rank">{String(index + 1).padStart(2, '0')}</span>
                <img
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackPoster;
                  }}
                />
                <span className="trending-info">
                  <strong>{movie.title}</strong>
                  <small>{movie.release_date?.slice(0, 4) || 'New release'}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Trending;
