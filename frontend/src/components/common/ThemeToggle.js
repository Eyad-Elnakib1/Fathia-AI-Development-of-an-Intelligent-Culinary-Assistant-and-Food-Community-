import React, { useState, useRef, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ toggleTheme }) => {
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  const handleStart = (clientY) => {
    setIsDragging(true);
    startYRef.current = clientY;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientY);
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleMove = (clientY) => {
      if (!isDragging) return;
      const deltaY = clientY - startYRef.current;
      const clampedY = Math.max(0, Math.min(45, deltaY));
      setPullY(clampedY);
    };

    const handleMouseMove = (e) => handleMove(e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientY);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (pullY >= 15) {
        toggleTheme();
      }
      setPullY(0);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, pullY, toggleTheme]);

  return (
    <div className="fridge-toggle-container" title="Pull rope down to toggle theme">
      <svg className="fridge-toggle-scene" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 197.451 481.081">
        <defs>
          <marker id="fridge-a" orient="auto" overflow="visible" refX="0" refY="0">
            <path className="fridge-toggle-scene__cord-end" fillRule="evenodd" strokeWidth=".2666" d="M.98 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
          </marker>
          <clipPath id="fridge-g" clipPathUnits="userSpaceOnUse">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.677" d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"></path>
          </clipPath>
        </defs>

        <g className="fridge-toggle-lamp-body">
          {/* Pull Rope Handle */}
          <g
            className="fridge-toggle-scene__cords"
            style={{
              transform: `translateY(${pullY * 1.8}px)`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <path className="fridge-toggle-scene__cord" markerEnd="url(#fridge-a)" fill="none" strokeLinecap="square" strokeWidth="6" d="M123.228-28.56v150.493" transform="translate(-24.503 256.106)"></path>
            <path className="fridge-toggle-scene__cord" markerEnd="url(#fridge-a)" fill="none" strokeLinecap="square" strokeWidth="6" d="M123.228-28.59s28 8.131 28 19.506-18.667 13.005-28 19.507c-9.333 6.502-28 8.131-28 19.506s28 19.507 28 19.507" transform="translate(-24.503 256.106)"></path>
            <path className="fridge-toggle-scene__cord" markerEnd="url(#fridge-a)" fill="none" strokeLinecap="square" strokeWidth="6" d="M123.228-28.575s-20 16.871-20 28.468c0 11.597 13.333 18.978 20 28.468 6.667 9.489 20 16.87 20 28.467 0 11.597-20 28.468-20 28.468" transform="translate(-24.503 256.106)"></path>
            <path className="fridge-toggle-scene__cord" markerEnd="url(#fridge-a)" fill="none" strokeLinecap="square" strokeWidth="6" d="M123.228-28.569s16 20.623 16 32.782c0 12.16-10.667 21.855-16 32.782-5.333 10.928-16 20.623-16 32.782 0 12.16 16 32.782 16 32.782" transform="translate(-24.503 256.106)"></path>
            <path className="fridge-toggle-scene__cord" markerEnd="url(#fridge-a)" fill="none" strokeLinecap="square" strokeWidth="6" d="M123.228-28.563s-10 24.647-10 37.623c0 12.977 6.667 25.082 10 37.623 3.333 12.541 10 24.647 10 37.623 0 12.977-10 37.623-10 37.623" transform="translate(-24.503 256.106)"></path>
            <g className="fridge-toggle-scene__dummy-cord">
              <line markerEnd="url(#fridge-a)" x1="98.7255" x2="98.7255" y1="240.5405" y2="380.5405"></line>
            </g>
            <circle className="fridge-toggle-scene__hit-spot" cx="98.7255" cy="380.5405" r="60" fill="transparent"></circle>
          </g>

          {/* Lightbulb (Static) */}
          <g className="fridge-toggle-scene__bulb fridge-bulb" transform="translate(844.069 -645.213)">
            <path className="fridge-bulb__cap" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.677" d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"></path>
            <path className="fridge-bulb__cap-shine" d="M-778.379 802.873h25.512v118.409h-25.512z" clipPath="url(#fridge-g)" transform="matrix(.52452 0 0 .90177 -368.282 82.976)"></path>
            <path className="fridge-bulb__cap" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v0s-8.439 10.115-28.817 10.115c-21.673 0-29.59-10.115-29.59-10.115z"></path>
            <path className="fridge-bulb__cap-outline" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.677" d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"></path>
            <g className="fridge-bulb__filament" fill="none" strokeLinecap="round" strokeWidth="5">
              <path d="M-752.914 823.875l-8.858-33.06"></path>
              <path d="M-737.772 823.875l8.858-33.06"></path>
            </g>
            <path className="fridge-bulb__bulb" strokeLinecap="round" strokeWidth="5" d="M-783.192 803.855c5.251 8.815 5.295 21.32 13.272 27.774 12.299 8.045 36.46 8.115 49.127 0 7.976-6.454 8.022-18.96 13.273-27.774 3.992-6.7 14.408-19.811 14.408-19.811 8.276-11.539 12.769-24.594 12.769-38.699 0-35.898-29.102-65-65-65-35.899 0-65 29.102-65 65 0 13.667 4.217 26.348 12.405 38.2 0 0 10.754 13.61 14.746 20.31z"></path>
            <circle className="fridge-bulb__flash" cx="-745.343" cy="743.939" r="83.725" fill="none" strokeDasharray="10,30" strokeLinecap="round" strokeLinejoin="round" strokeWidth="10"></circle>
            <path className="fridge-bulb__shine" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" d="M-789.19 757.501a45.897 45.897 0 013.915-36.189 45.897 45.897 0 0129.031-21.957"></path>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ThemeToggle;
