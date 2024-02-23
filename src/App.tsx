import { memo, useCallback, useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import "./App.css";
import { useFetchMovieDetails } from "./useFetchMovieDetails";
import { useLocalStorage } from "./useLocalStorage";
import { useKey } from "./useKey";

const average = (arr: any) => {
  return arr?.reduce((acc: any, curr: any, i: any, arr: any) => {
    return acc + curr / arr.length;
  }, 0);
};

function App() {
  const [query, setQuery] = useState("");
  const [searchedMovies, setSearchedMovies] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  // const [watchedMovies, setWatchedMovies] = useState<any>(() => {
  //   const value = localStorage.getItem("watchedMovies");
  //   if (value) return JSON.parse(value);
  // });
  const [watchedMovies, setWatchedMovies] = useLocalStorage(
    [],
    "watchedMovies"
  );
  function handleSelectedId(id: any) {
    console.log(id);
    setSelectedId(id);
  }
  const handleAddMovies = function (movie: any) {
    setWatchedMovies((watchedMovies: any) => [...watchedMovies, movie]);
  };
  // localStorage.setItem(
  //   "watchedMovies",
  //   JSON.stringify([...watchedMovies, movie])
  // );

  // useEffect(() => {
  //   console.log(localStorage, "lovalStorage");
  //   localStorage.setItem("watchedMovies", JSON.stringify(watchedMovies));
  // }, [watchedMovies]);

  // useEffect(() => {
  //   const value = window.localStorage.getItem("watchedMovies");
  //   if (value !== null) {
  //     JSON.parse(value);
  //     console.log(value);
  //   }
  // }, []);

  const handleCloseMovie = useCallback(
    function () {
      setSelectedId("");
    },
    [selectedId]
  );

  const handleDeleteMovie = useCallback(
    function (id: any) {
      setWatchedMovies(
        watchedMovies.filter((movie: any) => movie.imbdID != id)
      );
    },
    [watchedMovies]
  );

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

const Navbar = function ({ children }: any) {
  return (
    <div className="flex justify-between bg-indigo-600 h-16 w-[95%] mx-auto rounded-2xl items-center px-4 text-white mt-5">
      {children}
    </div>
  );
};

function Logo() {
  return (
    <div className="flex text-2xl gap-1 font-semibold">
      <span>🍿</span>
      <h2>usePopcorn</h2>
    </div>
  );
}

function InputBar({ onSetQuery, query }: any) {
  const inputRef = useRef<any>(null);
  // useEffect(() => {
  //   // inputRef.current.focus();
  //   console.log(inputRef);
  //   function callback(e: KeyboardEvent) {
  //     if (document.activeElement === inputRef.current) return;
  //     if (e.code === "Enter") {
  //       inputRef.current.focus();
  //       onSetQuery("");
  //     }
  //   }
  //   document.addEventListener("keydown", callback);
  // }, []);
  useKey("Enter", function () {
    if (document.activeElement === inputRef.current) return;
    inputRef.current.focus();
    onSetQuery("");
  });

  return (
    <input
      type="text"
      ref={inputRef}
      value={query}
      placeholder="Search movies..."
      className="h-10 w-1/2 rounded-lg bg-indigo-500 p-2 outline-none"
      onChange={(e: any) => {
        onSetQuery(e.target.value);
      }}
    />
  );
}

const Results = memo(function ({ movies }: any) {
  return <p>Found {movies && movies.length} results</p>;
});

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
        <ul>
          {movies &&
            movies.map((movie: any, i: any) => (
              <Movie
                movie={movie}
                key={movie.Title}
                onSelectId={onSelectId}
                selectedId={selectedId}
              />
            ))}
        </ul>
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
    <li
      className={`flex items-center gap-4 p-4 text-white cursor-pointer hover:bg-gray-600`}
      onClick={() => onSelectId(movie.imdbID)}
    >
      <img src={movie.Poster} alt={movie.Title} className="object-cover w-12" />
      <div>
        <p>{movie.Title}</p>
        <p className="flex">🗓 {movie.Year}</p>
      </div>
    </li>
  );
}

const WatchedMovieDetails = memo(function ({
  watchedMovies,
  onWatchedMovies,
  selectedId,
  onCloseMovie,
  onSelectId,
}: any) {
  const [userRating, setUserRating] = useState(0);
  // const [selectedMovie, setSelectedMovie] = useState<any>();
  // const [isLoading, setIsLoading] = useState(false);
  const { isLoading, selectedMovie } = useFetchMovieDetails(selectedId);

  const countReft = useRef(0);

  useKey("Escape", onCloseMovie);
  // useEffect(() => {
  //   function handleEscapePress(e: KeyboardEvent) {
  //     if (e.key == "Escape") {
  //       onCloseMovie();
  //     }
  //   }
  //   window.addEventListener("keydown", handleEscapePress);
  //   return () => window.removeEventListener("keydown", handleEscapePress);
  // }, []);

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

  useEffect(() => {
    if (userRating) countReft.current += 1;
    console.log(countReft.current, "=========userClicked The stars");
  }, [userRating]);
  if (!selectedMovie) return;
  const {
    Genre: genre,
    Released: released,
    Title: title,
    Poster: poster,
    imdbRating,
    Runtime: runtime,
  } = selectedMovie;

  function handleAdd() {
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
      {isLoading ? (
        <Loading />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
});

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
        <StarRatingBox
          onUserRating={onUserRating}
          onAddMovie={onAddMovie}
          userRating={userRating}
        />
      )}
    </div>
  );
}

const StarRatingBox = function ({ onUserRating, userRating, onAddMovie }: any) {
  return (
    <>
      <StarRating numOfStar={10} color={"gold"} onSetRating={onUserRating} />
      {userRating > 0 && (
        <button
          className="px-6 py-1 bg-indigo-600 rounded-lg"
          onClick={onAddMovie}
        >
          + Add to List
        </button>
      )}
    </>
  );
};

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

const WatchedMovieStats = memo(function ({
  watchedMovies,
  onDeleteMovie,
}: any) {
  console.log(watchedMovies, "==========watchedMovies");
  const userRating = average(
    watchedMovies?.map((m: any) => Number(m.userRating))
  );
  const imdbRating = average(
    watchedMovies?.map((m: any) => Number(m.imdbRating))
  );
  const runtime = average(
    watchedMovies?.map((m: any) => Number(m.runtime.split(" ")[0]))
  );
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-28 gap-2 rounded-xl z-10 shadow-2xl bg-gray-600 px-4">
        <h3 className="font-semibold">MOVIES YOU WATCHED</h3>
        <div className="flex gap-2">
          <span>#️⃣ {watchedMovies?.length} movies</span>
          <span>⭐ {imdbRating.toFixed(1)}</span>
          <span>🌟 {userRating.toFixed(1)}</span>
          <span>⏳ {runtime.toFixed(2)} min</span>
        </div>
      </div>
      <ul className="">
        {watchedMovies?.map((movie: any) => (
          <WatchedMovie
            movie={movie}
            key={movie.Title}
            onDeleteMovie={onDeleteMovie}
          />
        ))}
      </ul>
    </div>
  );
});

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
