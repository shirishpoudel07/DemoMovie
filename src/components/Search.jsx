import React from 'react';

const Search = ({ searchTerm, setSearchTerm, isLoading }) => {
    return (
        <div className="search" aria-busy={isLoading}>
            <div>
                <img src={`${import.meta.env.BASE_URL}search.svg`} alt="" />
                <input
                    type="search"
                    aria-label="Search movies"
                    placeholder="Search for a movie"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                            setSearchTerm('');
                        }
                    }}
                />
                {isLoading && <span className="search-loading" aria-hidden="true" />}
                {searchTerm && (
                    <button
                        type="button"
                        className="clear-search"
                        aria-label="Clear movie search"
                        onClick={() => setSearchTerm('')}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                )}

            </div>
            <span className="sr-only" aria-live="polite">
                {isLoading ? 'Updating movie results' : 'Movie results updated'}
            </span>
        </div>
    );
};

export default Search;