import React from 'react';

const MovieCard = ({
    movie: { title, vote_average, poster_path, release_date, original_language },
}) => {
    const posterUrl = poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : '/no-movie.png';
    const releaseYear = release_date ? release_date.split('-')[0] : 'Unknown year';

    return (
        <li className="movie-card">
            <img
                src={posterUrl}
                alt={`${title} poster`}
                loading="lazy"
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = '/no-movie.png';
                }
            }
                
            />
            <div className="content">
                <h3>{title}</h3>
                <div className="rating">
                    <img src="/star.svg" alt="" />
                    <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                </div>
                <span className="lang">{original_language || 'N/A'}</span>
                <span className="year">{releaseYear}</span>
            </div>
        </li>
    );
};

export default MovieCard;