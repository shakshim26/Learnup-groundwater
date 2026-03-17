import { useEffect } from "react";
import gsap from "gsap";

export default function PageTransition({ children }) {
  useEffect(() => {
    gsap.fromTo(
      ".page",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  return <div className="page">{children}</div>;
}
