import React from "react";

/**
 * PixelSprite
 * -----------
 * Renders an 8x8 (or NxN) matrix of 1s and 0s as blocky pixel-art,
 * using plain SVG <rect> tags. One matrix = one sprite. Reused by
 * every "retro pixel monster" icon so we only write the grid logic once.
 */
export default function PixelSprite({ matrix, color = "#39ff6a", className = "", style = {} }) {
  const size = matrix.length;
  const cell = 8; // px per pixel-block in the 0-64 viewBox

  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${size * cell} ${size * cell}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {matrix.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
}