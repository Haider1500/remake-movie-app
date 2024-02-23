import { useEffect, useState } from "react";

export function useFetchMovieDetails(id: any) {
  const [selectedMovie, setSelectedMovie] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchMovie() {
      setIsLoading(true);
      const data = await fetch(
        `http://www.omdbapi.com/?apikey=654c0727&i=${id}`
      );
      const response = await data.json();
      setSelectedMovie(response);
      setIsLoading(false);
    }
    fetchMovie();
  }, [id]);
  return { selectedMovie, isLoading };
}
