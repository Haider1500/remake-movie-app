import { useState } from "react";

function Stars({ numOfStar = 5, color = "gold", onSetRating }: any) {
  const [hoveredStar, setHoveredStar] = useState("");
  const [rating, setRating] = useState();

  function handleRating(e: any) {
    setRating(e.target.id);
    onSetRating(e.target.id);
  }

  return (
    <div className="flex gap-2">
      <ul className="flex">
        {Array.from({ length: numOfStar }, (_, i) => (
          <Star
            color={color}
            key={i}
            starId={i + 1}
            setHoveredStar={setHoveredStar}
            hoveredStar={hoveredStar}
            onSetRating={handleRating}
            rating={rating}
          />
        ))}
      </ul>
      <Counter hoveredStar={hoveredStar} rating={rating} />
    </div>
  );
}
export default Stars;

function Star({
  color,
  starId,
  hoveredStar,
  setHoveredStar,
  onSetRating,
  rating,
}: any) {
  const isFilled = hoveredStar >= starId || rating >= starId;
  return (
    <span onClick={onSetRating}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={`${isFilled ? color : "none"}`}
        stroke={`${color}`}
        id={starId}
        className={`w-5 h-6`}
        onPointerEnter={(e: any) => {
          setHoveredStar(e.target.id);
        }}
        onPointerLeave={() => setHoveredStar("")}
      >
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          id={starId}
        />
      </svg>
    </span>
  );
}

function Counter({ hoveredStar, rating }: any) {
  return (
    <span className="w-6 absolute right-6">
      {!rating ? hoveredStar : rating}
    </span>
  );
}
