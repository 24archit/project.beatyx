import { useEffect, useRef, useState } from "react";
import "../assets/styles/ScrollReveal.css";

export const ScrollReveal = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, unobserve it so the animation only happens once
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" } // Triggers slightly before element enters view
    );

    if (domRef.current) observer.observe(domRef.current);

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className}`} ref={domRef}>
      {children}
    </div>
  );
};
