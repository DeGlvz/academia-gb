import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  const { pathname } = useLocation();
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const updatePosition = useCallback(() => {
    setVisible(window.scrollY > 350);

    if (!footerRef.current) {
      footerRef.current = document.querySelector("footer");
    }
    const footer = footerRef.current;
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      const overlap = window.innerHeight - footerRect.top;
      setBottomOffset(overlap > 0 ? overlap : 0);
    } else {
      setBottomOffset(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => window.removeEventListener("scroll", updatePosition);
  }, [updatePosition]);

  const baseBottom = typeof window !== "undefined" && window.innerWidth >= 768 ? 24 : 16;
  const finalBottom = baseBottom + bottomOffset;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Subir al inicio"
      style={{ bottom: `${finalBottom}px` }}
      className={`fixed right-4 md:right-6 z-[99] w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] cursor-pointer ${
        visible ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"
      }`}
    >
      <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
};

export default ScrollToTop;
