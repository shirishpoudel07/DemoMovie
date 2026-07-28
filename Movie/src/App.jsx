import React from 'react'
import Search from "./components/Search.jsx"
const App = () => {
return(
    <main>
        <div className="pattern">
<div className="wrapper">
<header>
    <img src="public/hero.png" alt="Hero Banner"/>
    <h1>Find <span className="text-gradient">Movie</span> You'll Enjoy Without Hassle </h1>

</header>


<Search/>
</div>
        </div>
    </main>
    )
}

export default App 