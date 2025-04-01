import React from 'react'
import  {useSelector} from "react-redux"

function MovieList() {
const movies = useSelector((state)=>state.movies.movieList)

  
return (
    <>
   <div>Movies</div>
   {movies.map((movie)=>(

<div key={movie.id}>{movie.name}
</div>

)

   )}
   </>
)

}

export default MovieList
