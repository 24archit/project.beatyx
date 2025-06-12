import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/Carousel.css";

export default function Carousel({
  children,
  className = "",
  showArrows = true,
  showDots = true,
  autoScroll = false,
  autoScrollInterval = 3000,
  responsive = {
    mobile: 2,
    tablet: 3,
    medium: 4,
    large: 5,
    desktop: 6
  },
  gap = "1rem",
  arrowStyle = {},
  dotStyle = {}
}) {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(responsive.desktop);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const totalItems = React.Children.count(children);

  // Update cards per view on resize
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setCardsPerView(responsive.mobile);
      else if (w < 768) setCardsPerView(responsive.tablet);
      else if (w < 1024) setCardsPerView(responsive.medium);
      else if (w < 1280) setCardsPerView(responsive.large);
      else setCardsPerView(responsive.desktop);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [responsive]);

  // Compute card width + gap
  const getCardWidth = () => {
    const container = containerRef.current;
    if (container && container.firstChild) {
      const card = container.firstChild;
      const gapSize = parseFloat(getComputedStyle(container).gap) || 0;
      return card.offsetWidth + gapSize;
    }
    return 0;
  };

  // Update arrow visibility based on container scroll
  const updateArrows = () => {
    const container = containerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth);
    }
  };

  useEffect(() => {
    updateArrows();
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateArrows);
      return () => container.removeEventListener('scroll', updateArrows);
    }
  }, [cardsPerView, totalItems]);

  // Scroll to a specific index
  const scrollToPosition = (idx) => {
    const container = containerRef.current;
    const cardW = getCardWidth();
    container.scrollTo({ left: idx * cardW, behavior: 'smooth' });
    setCurrentIndex(idx);
  };

  // Scroll left by one page
  const scrollLeft = () => {
    const newIdx = Math.max(0, currentIndex - cardsPerView);
    scrollToPosition(newIdx);
  };

  // Scroll right by one page or to end
  const scrollRight = () => {
    const container = containerRef.current;
    const cardW = getCardWidth();
    const maxIdx = totalItems - cardsPerView;
    if (currentIndex + cardsPerView <= maxIdx) {
      scrollToPosition(currentIndex + cardsPerView);
    } else {
      // final scroll to show remaining cards
      const remainingScroll = container.scrollWidth - container.clientWidth - container.scrollLeft;
      container.scrollBy({ left: remainingScroll, behavior: 'smooth' });
      setCurrentIndex(maxIdx + 1); // mark as beyond full pages
    }
  };

  // Dot navigation
  const scrollToPage = (page) => {
    scrollToPosition(page * cardsPerView);
  };

  const showNav = totalItems > cardsPerView;
  const totalPages = Math.ceil(totalItems / cardsPerView);
  const currentPage = Math.floor(currentIndex / cardsPerView);

  return (
    <div className={`carousel-wrapper ${className}`}>
      {showNav && showArrows && canScrollLeft && (
        <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft} style={arrowStyle} aria-label="Scroll left">
          <i className="fa-solid fa-chevron-left" />
        </button>
      )}

      <div className="carousel-container" ref={containerRef} style={{ gap }}>
        {React.Children.map(children, (child, i) => (
          <div key={i} className="carousel-card">{child}</div>
        ))}
      </div>

      {showNav && showArrows && canScrollRight && (
        <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight} style={arrowStyle} aria-label="Scroll right">
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}

      {showNav && showDots && totalPages > 1 && (
        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, p) => (
            <button
              key={p}
              className={`carousel-dot ${currentPage === p ? 'active' : ''}`}
              onClick={() => scrollToPage(p)}
              style={dotStyle}
              aria-label={`Go to page ${p + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}