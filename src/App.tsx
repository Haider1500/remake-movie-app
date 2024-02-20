import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr: any) => {
  return arr.reduce((acc: any, curr: any, i: any, arr: any) => {
    return acc + curr / arr.length;
  }, 0);
};

function App() {
  const [query, setQuery] = useState("");
  const [searchedMovies, setSearchedMovies] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [watchedMovies, setWatchedMovies] = useState([]);

  function handleSelectedId(id: any) {
    console.log(id);
    setSelectedId(id);
  }
  return (
    <div className="flex flex-col h-screen bg-gray-800 relative top-0">
      <Navbar>
        <Logo />
        <InputBar onSetQuery={setQuery} query={query} />
        <Results movies={searchedMovies} />
      </Navbar>
      <Main>
        <Box>
          <MoviesList
            movies={searchedMovies}
            selectedId={selectedId}
            onSelectId={handleSelectedId}
            onSearchedMovies={setSearchedMovies}
            query={query}
          />
        </Box>
        <Box>
          <WatchedMovieDetails watchedMovies={watchedMovies} />

          {/* 
          <MoviePreview />
          <MovieDetails /> */}
        </Box>
      </Main>
    </div>
  );
}

export default App;

function Navbar({ children }: any) {
  return (
    <div className="flex justify-between bg-indigo-600 h-16 w-[95%] mx-auto rounded-2xl items-center px-4 text-white mt-5">
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex text-2xl gap-1 font-semibold">
      <span>🍿</span>
      <h2>usePopcorn</h2>
    </div>
  );
}

function InputBar({ onSetQuery, movies }: any) {
  return (
    <input
      type="text"
      placeholder="Search movies..."
      className="h-10 w-1/2 rounded-lg bg-indigo-500 p-2 outline-none"
      // value={query}
      onChange={(e: any) => {
        onSetQuery(e.target.value);
      }}
    />
  );
}

function Results({ movies }: any) {
  return <p>Found {movies && movies.length} results</p>;
}

function Main({ children }: any) {
  return (
    <div className="flex flex-1 p-4 justify-center gap-8 overflow-hidden">
      {children}
    </div>
  );
}

function Box({ children }: any) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col w-[500px] rounded-xl bg-gray-700 text-white z-0 relative overflow-hidden">
      <button
        className="text-xl h-6 flex items-center justify-center bg-black w-6 rounded-xl absolute top-2 right-2"
        onClick={() => setOpen(!open)}
      >
        {open ? "-" : "+"}
      </button>
      {open && children}
    </div>
  );
}

function MoviesList({
  movies,
  onSelectId,
  selectedId,
  onSearchedMovies,
  query,
}: any) {
  useEffect(() => {
    const abortController = new AbortController();
    async function fetchData() {
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=654c0727&s=${query}`,
        { signal: abortController.signal }
      );
      const response = await res.json();
      onSearchedMovies(response.Search);
    }
    if (!query || query.length === 2) return;
    fetchData();
    return () => abortController.abort();
  }, [query]);
  return (
    <div className="overflow-y-scroll">
      {movies &&
        movies.map((movie: any, i: any) => (
          <Movie
            movie={movie}
            key={movie.imdbID}
            onSelectId={onSelectId}
            selectedId={selectedId}
          />
        ))}
    </div>
  );
}

function Movie({ movie, onSelectId, selectedId }: any) {
  // const isSelected = selectedId == movie.imdbID;
  return (
    <div
      className={`flex items-center gap-4 p-4 text-white cursor-pointer hover:bg-gray-600`}
      onClick={() => onSelectId(movie.imdbID)}
    >
      <img src={movie.Poster} alt={movie.Title} className="object-cover w-12" />
      <div>
        <p>{movie.Title}</p>
        <p className="flex">🗓 {movie.Year}</p>
      </div>
    </div>
  );
}

function WatchedMovieDetails({ watchedMovies }: any) {
  // console.log(watchedMovies);
  const userRating = average(watchedMovies.map((m: any) => m.userRating));
  const imdbRating = average(watchedMovies.map((m: any) => m.imdbRating));
  const runtime = average(watchedMovies.map((m: any) => m.runtime));

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-28 gap-2 rounded-xl z-10 shadow-2xl bg-gray-600">
        <h3 className="font-semibold">MOVIES YOU WATCHED</h3>
        <div className="flex gap-2">
          <span>#️⃣ 0 movies</span>
          <span>⭐ {imdbRating}</span>
          <span>🌟 {userRating}</span>
          <span>⏳ {runtime} min</span>
        </div>
      </div>
      <ul className="">
        {watchedMovies.map((movie: any) => (
          <WatchedMovie movie={movie} key={movie.Title} />
        ))}
      </ul>
    </div>
  );
}

function WatchedMovie({ movie }: any) {
  return (
    <li className="flex items-center p-4 gap-4">
      <img src={movie.Poster} alt="" className="object-cover w-16" />
      <div>
        <h2>{movie.Title}</h2>
        <span>⭐️ {movie.imdbRating}</span>
        <span>🌟 {movie.userRating}</span>
        <span>⏳ {movie.runtime}</span>
      </div>
    </li>
  );
}
const selectedMovie = {
  imdbID: "tt1375666",
  Title: "Inception",
  Year: "2010",
  Poster:
    "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  runtime: 148,
  imdbRating: 8.8,
  userRating: 10,
  date: "31 Mar 2015",
};

function MoviePreview() {
  return (
    <header className="flex gap-4 items-center rounded-lg bg-gray-600 ">
      <Poster />
      <MovieRatings />
    </header>
  );
}

function Poster() {
  return <img src={selectedMovie?.Poster} alt="" className="w-32" />;
}

function MovieRatings() {
  return (
    <div className="flex flex-col gap-2 pt-4">
      <h2 className="font-semibold text-2xl">{selectedMovie?.Title}</h2>
      <p>{selectedMovie?.date}• 51 min</p>
      <p>Documentary</p>
      <p>⭐7.1 IMDb rating</p>
    </div>
  );
}

function MovieDetails({}: any) {
  const [userRating, setUserRating] = useState();
  function handleAdd() {
    console.log(userRating, "======userRating");
  }
  return (
    <div className="flex flex-col items-center justify-center grow gap-4 p-2">
      <AddMovieToList onUserRating={setUserRating} onAddMovie={handleAdd} />
      <MovieCast />
    </div>
  );
}

function AddMovieToList({ onUserRating, onAddMovie }: any) {
  return (
    <div className="items-center justify-center flex w-11/12  bg-gray-600 rounded-xl flex-col gap-2 h-fit px-4 py-2">
      <StarRating numOfStar={10} color={"gold"} onSetRating={onUserRating} />
      <button
        className="px-6 py-1 bg-indigo-600 rounded-lg"
        onClick={onAddMovie}
      >
        + Add to List
      </button>
    </div>
  );
}

function MovieCast() {
  return (
    <div className="flex flex-col w-11/12 gap-4 ">
      <p>
        <em>The Science of Christopher Nolan's Sci-Fi, Interstellar.</em>
      </p>
      <p>Starring Matthew McConaughey, Kip Thorne, Christopher Nolan</p>
      <p>Directed by Gail Willumsen</p>
    </div>
  );
}
