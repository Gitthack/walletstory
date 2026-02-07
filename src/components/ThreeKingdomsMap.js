"use client";

import { useState } from "react";
import { TERRITORY_MAP, TILE_VISUALS, FACTIONS, PROVINCES } from "@/lib/gamedata";

// SVG-based tile rendering for the territory map
// Inspired by the pixel art grid style of Image 1 and
// the Chinese province layout of Image 2

function TileContent({ tile, size }) {
  const visual = TILE_VISUALS[tile.type] || TILE_VISUALS.plains;

  // Each tile type gets a unique visual treatment
  const tileStyles = {
    mountain: (
      <>
        <polygon points={`${size*0.5},${size*0.15} ${size*0.8},${size*0.75} ${size*0.2},${size*0.75}`} fill="#8B7340" stroke="#5C4033" strokeWidth="1" />
        <polygon points={`${size*0.5},${size*0.15} ${size*0.62},${size*0.42} ${size*0.38},${size*0.42}`} fill="#E8D5A8" />
        <polygon points={`${size*0.35},${size*0.55} ${size*0.55},${size*0.35} ${size*0.65},${size*0.55}`} fill="#9C8050" stroke="#5C4033" strokeWidth="0.5" />
      </>
    ),
    forest: (
      <>
        <polygon points={`${size*0.3},${size*0.25} ${size*0.4},${size*0.7} ${size*0.2},${size*0.7}`} fill="#4A7340" stroke="#2C4420" strokeWidth="0.8" />
        <polygon points={`${size*0.55},${size*0.2} ${size*0.68},${size*0.65} ${size*0.42},${size*0.65}`} fill="#3D6635" stroke="#2C4420" strokeWidth="0.8" />
        <polygon points={`${size*0.75},${size*0.3} ${size*0.85},${size*0.68} ${size*0.65},${size*0.68}`} fill="#527A45" stroke="#2C4420" strokeWidth="0.8" />
        <rect x={size*0.28} y={size*0.65} width={size*0.04} height={size*0.12} fill="#5C4033" />
        <rect x={size*0.53} y={size*0.6} width={size*0.04} height={size*0.12} fill="#5C4033" />
      </>
    ),
    plains: (
      <>
        <path d={`M${size*0.1},${size*0.6} Q${size*0.3},${size*0.45} ${size*0.5},${size*0.55} Q${size*0.7},${size*0.65} ${size*0.9},${size*0.5}`} fill="none" stroke="#8B7340" strokeWidth="1" opacity="0.5" />
        <path d={`M${size*0.15},${size*0.7} Q${size*0.4},${size*0.6} ${size*0.6},${size*0.68} Q${size*0.8},${size*0.75} ${size*0.9},${size*0.65}`} fill="none" stroke="#8B7340" strokeWidth="0.8" opacity="0.3" />
        {/* Grass tufts */}
        <line x1={size*0.3} y1={size*0.5} x2={size*0.32} y2={size*0.42} stroke="#6B8E23" strokeWidth="1" />
        <line x1={size*0.6} y1={size*0.55} x2={size*0.62} y2={size*0.47} stroke="#6B8E23" strokeWidth="1" />
      </>
    ),
    city: (
      <>
        {/* Buildings cluster */}
        <rect x={size*0.2} y={size*0.35} width={size*0.2} height={size*0.35} fill="#C4A96A" stroke="#8B7340" strokeWidth="1" />
        <rect x={size*0.45} y={size*0.3} width={size*0.25} height={size*0.4} fill="#C4A96A" stroke="#8B7340" strokeWidth="1" />
        {/* Roofs */}
        <polygon points={`${size*0.15},${size*0.35} ${size*0.3},${size*0.2} ${size*0.45},${size*0.35}`} fill="#8B4513" stroke="#5C3310" strokeWidth="0.8" />
        <polygon points={`${size*0.4},${size*0.3} ${size*0.575},${size*0.15} ${size*0.75},${size*0.3}`} fill="#A0522D" stroke="#5C3310" strokeWidth="0.8" />
        <rect x={size*0.28} y={size*0.5} width={size*0.06} height={size*0.1} fill="#5C4033" />
      </>
    ),
    castle: (
      <>
        {/* Castle wall */}
        <rect x={size*0.15} y={size*0.3} width={size*0.7} height={size*0.45} fill="#B8860B" stroke="#8B6508" strokeWidth="1.5" rx="2" />
        {/* Battlements */}
        {[0.15, 0.3, 0.45, 0.6, 0.75].map((x, i) => (
          <rect key={i} x={size*x} y={size*0.22} width={size*0.08} height={size*0.1} fill="#B8860B" stroke="#8B6508" strokeWidth="0.8" />
        ))}
        {/* Gate */}
        <rect x={size*0.38} y={size*0.5} width={size*0.24} height={size*0.25} fill="#5C4033" rx="12" />
        {/* Tower */}
        <rect x={size*0.4} y={size*0.1} width={size*0.2} height={size*0.15} fill="#DAA520" stroke="#8B6508" strokeWidth="1" />
        <polygon points={`${size*0.35},${size*0.1} ${size*0.5},${size*0.0} ${size*0.65},${size*0.1}`} fill="#CD853F" stroke="#8B6508" strokeWidth="0.8" />
      </>
    ),
    river: (
      <>
        <path d={`M${size*0.0},${size*0.3} Q${size*0.25},${size*0.5} ${size*0.5},${size*0.4} Q${size*0.75},${size*0.3} ${size*1},${size*0.5}`} fill="none" stroke="#4A90D9" strokeWidth="3" opacity="0.6" />
        <path d={`M${size*0.0},${size*0.6} Q${size*0.3},${size*0.7} ${size*0.5},${size*0.6} Q${size*0.7},${size*0.5} ${size*1},${size*0.65}`} fill="none" stroke="#4A90D9" strokeWidth="2" opacity="0.4" />
      </>
    ),
    lake: (
      <>
        <ellipse cx={size*0.5} cy={size*0.5} rx={size*0.35} ry={size*0.25} fill="#4A90D9" opacity="0.3" stroke="#4A90D9" strokeWidth="1" />
        <ellipse cx={size*0.5} cy={size*0.5} rx={size*0.25} ry={size*0.15} fill="#4A90D9" opacity="0.2" />
      </>
    ),
    pass: (
      <>
        {/* Gate structure */}
        <rect x={size*0.25} y={size*0.2} width={size*0.12} height={size*0.6} fill="#8B4513" stroke="#5C3310" strokeWidth="1" />
        <rect x={size*0.63} y={size*0.2} width={size*0.12} height={size*0.6} fill="#8B4513" stroke="#5C3310" strokeWidth="1" />
        {/* Arch */}
        <path d={`M${size*0.25},${size*0.35} Q${size*0.5},${size*0.1} ${size*0.75},${size*0.35}`} fill="none" stroke="#CD853F" strokeWidth="2.5" />
        <line x1={size*0.25} y1={size*0.35} x2={size*0.75} y2={size*0.35} stroke="#CD853F" strokeWidth="1.5" />
      </>
    ),
    port: (
      <>
        <path d={`M${size*0.1},${size*0.7} Q${size*0.3},${size*0.6} ${size*0.5},${size*0.65} Q${size*0.7},${size*0.7} ${size*0.9},${size*0.6}`} fill="none" stroke="#4A90D9" strokeWidth="2" opacity="0.5" />
        {/* Boat */}
        <path d={`M${size*0.3},${size*0.45} Q${size*0.5},${size*0.55} ${size*0.7},${size*0.45}`} fill="#8B4513" stroke="#5C3310" strokeWidth="1" />
        <line x1={size*0.5} y1={size*0.45} x2={size*0.5} y2={size*0.2} stroke="#5C4033" strokeWidth="1" />
        <polygon points={`${size*0.5},${size*0.2} ${size*0.65},${size*0.35} ${size*0.5},${size*0.38}`} fill="#E8D5A8" stroke="#8B7340" strokeWidth="0.5" />
      </>
    ),
  };

  return tileStyles[tile.type] || tileStyles.plains;
}

function getFactionBg(faction) {
  switch (faction) {
    case "wei": return "rgba(74,144,217,0.08)";
    case "shu": return "rgba(217,74,74,0.08)";
    case "wu": return "rgba(74,217,122,0.08)";
    default: return "rgba(184,160,128,0.04)";
  }
}

function getFactionBorder(faction) {
  switch (faction) {
    case "wei": return "rgba(74,144,217,0.25)";
    case "shu": return "rgba(217,74,74,0.25)";
    case "wu": return "rgba(74,217,122,0.25)";
    default: return "rgba(184,160,128,0.15)";
  }
}

export default function ThreeKingdomsMap({ ownedTiles = [], onTileClick }) {
  const [hoveredTile, setHoveredTile] = useState(null);
  const TILE_SIZE = 68;
  const GAP = 3;
  const COLS = TERRITORY_MAP[0].length;
  const ROWS = TERRITORY_MAP.length;
  const mapWidth = COLS * (TILE_SIZE + GAP) + GAP;
  const mapHeight = ROWS * (TILE_SIZE + GAP) + GAP;

  return (
    <div className="tk-parchment tk-border rounded-xl p-5 overflow-x-auto">
      {/* Map title */}
      <div className="text-center mb-4 relative z-10">
        <h3 className="tk-title text-3xl mb-1">三国天下</h3>
        <p className="tk-text text-sm opacity-70">Territory of the Three Kingdoms</p>
      </div>

      {/* Faction legend */}
      <div className="flex justify-center gap-6 mb-4 relative z-10">
        {["wei", "shu", "wu"].map((f) => (
          <div key={f} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm border"
              style={{ background: FACTIONS[f].color, borderColor: FACTIONS[f].color }}
            />
            <span className="tk-text text-xs font-semibold">
              {FACTIONS[f].name} {FACTIONS[f].fullName.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* SVG Map */}
      <div className="flex justify-center relative z-10">
        <svg
          width={mapWidth}
          height={mapHeight}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="drop-shadow-md"
        >
          {/* Background */}
          <rect width={mapWidth} height={mapHeight} fill="none" />

          {TERRITORY_MAP.map((row, ri) =>
            row.map((tile, ci) => {
              const x = GAP + ci * (TILE_SIZE + GAP);
              const y = GAP + ri * (TILE_SIZE + GAP);
              const isHovered = hoveredTile?.r === ri && hoveredTile?.c === ci;
              const isOwned = ownedTiles.some((t) => t.r === ri && t.c === ci);

              return (
                <g
                  key={`${ri}-${ci}`}
                  onMouseEnter={() => setHoveredTile({ r: ri, c: ci, tile })}
                  onMouseLeave={() => setHoveredTile(null)}
                  onClick={() => onTileClick?.({ r: ri, c: ci, tile })}
                  style={{ cursor: "pointer" }}
                >
                  {/* Tile background */}
                  <rect
                    x={x}
                    y={y}
                    width={TILE_SIZE}
                    height={TILE_SIZE}
                    rx={4}
                    fill={getFactionBg(tile.faction)}
                    stroke={isHovered ? FACTIONS[tile.faction]?.color || "#8B7340" : getFactionBorder(tile.faction)}
                    strokeWidth={isHovered ? 2 : 1}
                  />

                  {/* Owned indicator */}
                  {isOwned && (
                    <rect
                      x={x + 1}
                      y={y + 1}
                      width={TILE_SIZE - 2}
                      height={TILE_SIZE - 2}
                      rx={3}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Tile content (SVG art) */}
                  <g transform={`translate(${x}, ${y})`}>
                    <TileContent tile={tile} size={TILE_SIZE} />
                  </g>

                  {/* Label */}
                  {tile.label && (
                    <text
                      x={x + TILE_SIZE / 2}
                      y={y + TILE_SIZE - 6}
                      textAnchor="middle"
                      className="tk-text"
                      style={{
                        fontSize: "9px",
                        fontFamily: "'Noto Serif SC', serif",
                        fill: "#2C1810",
                        fontWeight: 600,
                      }}
                    >
                      {tile.label}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoveredTile && (
        <div className="text-center mt-3 relative z-10">
          <span className="tk-text text-sm">
            <span className="font-semibold">{hoveredTile.tile.label || TILE_VISUALS[hoveredTile.tile.type]?.emoji}</span>
            {" · "}
            <span className="capitalize">{hoveredTile.tile.type}</span>
            {" · "}
            <span style={{ color: FACTIONS[hoveredTile.tile.faction]?.color }}>
              {FACTIONS[hoveredTile.tile.faction]?.name || "中立"}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
