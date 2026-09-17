import React from 'react'

const Search =({searchTerm, setSearchTerm}) => {
    return(   
        <div className="search">
            <div>
                <img src="search.svg" alt="search"></img>
<input
  type="text"
  placeholder="Search Shirish for the best Movie"
  value={searchTerm}
  onChange={(event) => setSearchTerm(event.target.value)}
/>

            </div>
        </div>
     )
}

export default Search 