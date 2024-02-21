import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import "./App.css";

const average = (arr: any) => {
  return arr.reduce((acc: any, curr: any, i: any, arr: any) => {
    return acc + curr / arr.length;
  }, 0);
};

function App() {
  const [query, setQuery] = useState("");
  const [searchedMovies, setSearchedMovies] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [watchedMovies, setWatchedMovies] = useState<any>([]);

  function handleSelectedId(id: any) {
    console.log(id);
    setSelectedId(id);
  }
  function handleAddMovies(movie: any) {
    setWatchedMovies((watchedMovies: any) => [...watchedMovies, movie]);
  }

  function handleCloseMovie() {
    setSelectedId("");
  }

  function handleDeleteMovie(id: any) {
    setWatchedMovies(watchedMovies.filter((movie: any) => movie.imbdID != id));
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
          {selectedId ? (
            <WatchedMovieDetails
              watchedMovies={watchedMovies}
              onWatchedMovies={handleAddMovies}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              onCloseMovie={handleCloseMovie}
            />
          ) : (
            <WatchedMovieStats
              watchedMovies={watchedMovies}
              onDeleteMovie={handleDeleteMovie}
            />
          )}
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
    <div className="flex flex-col w-[400px] rounded-xl bg-gray-700 text-white z-0 relative overflow-y-scroll scroll-bar ">
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchData() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=654c0727&s=${query}`,
        { signal: abortController.signal }
      );
      const response = await res.json();
      onSearchedMovies(response.Search);
      setIsLoading(false);
    }
    if (!query || query.length === 2) {
      onSearchedMovies([]);
      onSelectId(null);
      return;
    }
    fetchData();
    return () => abortController.abort();
  }, [query]);
  return (
    <div className="">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {movies &&
            movies.map((movie: any, i: any) => (
              <Movie
                movie={movie}
                key={movie.Title}
                onSelectId={onSelectId}
                selectedId={selectedId}
              />
            ))}
        </>
      )}
    </div>
  );
}

function Loading() {
  return <div className="border">Loading...</div>;
}

function Movie({ movie, onSelectId }: any) {
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

function WatchedMovieDetails({
  watchedMovies,
  onWatchedMovies,
  selectedId,
  onCloseMovie,
}: any) {
  const [userRating, setUserRating] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<any>();

  useEffect(
    function () {
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=654c0727&i=${selectedId}`
        );
        const watchedMovie = await res.json();
        setSelectedMovie(watchedMovie);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!selectedMovie?.Title) return;
      document.title = `movie | ${selectedMovie?.Title}`;
      return () => {
        document.title = "usePopcorn";
      };
    },
    [selectedMovie]
  );
  if (!selectedMovie) return;
  const {
    Genre: genre,
    Released: released,
    Title: title,
    Poster: poster,
    imdbRating,
    Runtime: runtime,
  } = selectedMovie;

  function handleEscapePress(e: KeyboardEvent) {
    if (e.key == "Escape") {
      onCloseMovie();
    }
  }
  window.addEventListener("keydown", handleEscapePress);

  function handleAdd() {
    console.log("control in handleAdd");
    const updatedMovie = {
      title,
      poster,
      imdbRating,
      userRating,
      runtime,
      imbdID: selectedMovie?.imdbID,
    };

    onWatchedMovies(updatedMovie);
    onCloseMovie();
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between rounded-lg bg-gray-600 ">
        <button
          className="absolute top-2 text-black w-8 bg-white rounded-xl"
          onClick={onCloseMovie}
        >
          &larr;
        </button>
        <img src={poster} alt="" className="w-28 h-52" />
        <div className="flex flex-col gap-2 p-4">
          <h2 className="font-semibold text-xl">{title}</h2>
          <p>{released} • 51 min</p>
          <p>{genre}</p>
          <p>⭐{imdbRating} IMDb rating</p>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center grow gap-4 p-2">
        <AddMovieToList
          userRating={userRating}
          onUserRating={setUserRating}
          onAddMovie={handleAdd}
          watchedMovies={watchedMovies}
          selectedMovie={selectedMovie}
        />
        <MovieCast selectedMovie={selectedMovie} />
      </div>
    </div>
  );
}

function AddMovieToList({
  userRating,
  onUserRating,
  onAddMovie,
  watchedMovies,
  selectedMovie,
}: any) {
  const isRated = watchedMovies
    .map((movie: any) => movie.imbdID)
    .includes(selectedMovie.imdbID);
  const myRating = watchedMovies.find(
    (movie: any) => movie.imbdID == selectedMovie.imdbID
  );
  console.log(myRating, "============myrating");

  return (
    <div className="items-center justify-center flex w-11/12  bg-gray-600 rounded-xl flex-col gap-2 h-fit px-4 py-2">
      {isRated ? (
        <p>you have rated ⭐{myRating.userRating}</p>
      ) : (
        <>
          <StarRating
            numOfStar={10}
            color={"gold"}
            onSetRating={onUserRating}
          />
          {userRating > 0 && (
            <button
              className="px-6 py-1 bg-indigo-600 rounded-lg"
              onClick={onAddMovie}
            >
              + Add to List
            </button>
          )}
        </>
      )}
    </div>
  );
}

function MovieCast({ selectedMovie }: any) {
  return (
    <div className="flex flex-col w-11/12 gap-4 ">
      <p>
        <em>{selectedMovie.Plot}</em>
      </p>
      <p>Starring {selectedMovie.Actors}</p>
      <p>Directed by {selectedMovie.Director}</p>
    </div>
  );
}

function WatchedMovieStats({ watchedMovies, onDeleteMovie }: any) {
  const userRating = average(
    watchedMovies.map((m: any) => Number(m.userRating))
  );
  const imdbRating = average(
    watchedMovies.map((m: any) => Number(m.imdbRating))
  );
  const runtime = average(
    watchedMovies.map((m: any) => Number(m.runtime.split(" ")[0]))
  );
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-28 gap-2 rounded-xl z-10 shadow-2xl bg-gray-600 px-4">
        <h3 className="font-semibold">MOVIES YOU WATCHED</h3>
        <div className="flex gap-2">
          <span>#️⃣ {watchedMovies.length} movies</span>
          <span>⭐ {imdbRating.toFixed(1)}</span>
          <span>🌟 {userRating.toFixed(1)}</span>
          <span>⏳ {runtime.toFixed(2)} min</span>
        </div>
      </div>
      <ul className="">
        {watchedMovies.map((movie: any) => (
          <WatchedMovie
            movie={movie}
            key={movie.Title}
            onDeleteMovie={onDeleteMovie}
          />
        ))}
      </ul>
    </div>
  );
}

function WatchedMovie({ movie, onDeleteMovie }: any) {
  return (
    <li className="flex items-center justify-between p-2 gap-4">
      <img src={movie.poster} alt={movie.title} className="object-cover w-24" />
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-lg">{movie.title}</h2>
        <div className="flex gap-2">
          <span>⭐️ {movie.imdbRating}</span>
          <span>🌟 {movie.userRating}</span>
          <span>⏳ {movie.runtime}</span>
        </div>
      </div>
      <button
        className="w-10 rounded-xl bg-red-700"
        onClick={() => onDeleteMovie(movie.imbdID)}
      >
        X
      </button>
    </li>
  );
}
