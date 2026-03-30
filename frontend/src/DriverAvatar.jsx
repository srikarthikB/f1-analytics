import React, { useState, useEffect, useCallback, useRef } from "react";

const POS_COLORS = { 1: "#f5c518", 2: "#a8b2be", 3: "#cd7f32" };

const DriverAvatar = React.memo(function DriverAvatar({ driver, size = 54, position }) {
  const [imgError, setImgError] = useState(false);
  const lastSrcRef = useRef(null);

  const src = driver?.headshot_url || null;

  useEffect(() => {
    if (src !== lastSrcRef.current) {
      lastSrcRef.current = src;
      setImgError(false);
    }
  }, [src]);

  const handleError = useCallback(() => {
    setImgError(true);
  }, []);

  if (!driver) return null;

  const borderColor = driver.team_colour || "#e10600";
  const nameSize = Math.max(13, size * 0.28);
  const showImage = !!src && !imgError;

  const posNum = Number(position);
  const isTop3 = posNum >= 1 && posNum <= 3;
  const posColor = POS_COLORS[posNum] || null;

  const circleSize = size;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        minWidth: 0,
      }}
    >
      {/* Avatar circle with position badge overlay */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          width: circleSize,
          height: circleSize,
          minWidth: circleSize,
          minHeight: circleSize,
        }}
      >
        {/* The circle itself */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            border: isTop3
              ? `2.5px solid ${posColor}`
              : `2px solid ${borderColor}`,
            backgroundColor: "#0d0d1a",
            boxSizing: "border-box",
            position: "relative",
            boxShadow: isTop3
              ? `0 0 14px ${posColor}55, 0 0 4px ${posColor}30`
              : `0 0 6px ${borderColor}20`,
          }}
        >
          {/* Driver headshot — always rendered, hidden via opacity when not needed */}
          {src && (
            <img
              src={src}
              alt={driver.full_name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                opacity: showImage ? 1 : 0,
                pointerEvents: "none",
              }}
              onError={handleError}
            />
          )}

          {/* Initials fallback — shown only when no valid image */}
          {!showImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: Math.max(10, circleSize * 0.3),
                fontWeight: 800,
                color: isTop3 ? posColor : borderColor,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                userSelect: "none",
                background: "radial-gradient(circle at center, rgba(255,255,255,0.04), transparent)",
              }}
            >
              {(driver.full_name || "?")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
        </div>

        {/* Position badge — bottom-left */}
        {position != null && (
          <div
            style={{
              position: "absolute",
              bottom: -3,
              left: -3,
              width: Math.max(18, circleSize * 0.36),
              height: Math.max(18, circleSize * 0.36),
              borderRadius: "50%",
              backgroundColor: isTop3 ? posColor : "#12121f",
              border: `2px solid ${isTop3 ? "#07070f" : "rgba(255,255,255,0.15)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: Math.max(9, circleSize * 0.19),
              fontWeight: 900,
              color: isTop3 ? "#07070f" : "rgba(255,255,255,0.6)",
              zIndex: 3,
              boxShadow: isTop3
                ? `0 0 10px ${posColor}70`
                : "0 2px 6px rgba(0,0,0,0.8)",
              lineHeight: 1,
            }}
          >
            {posNum}
          </div>
        )}
      </div>
    </div>
  );
});

export default DriverAvatar;