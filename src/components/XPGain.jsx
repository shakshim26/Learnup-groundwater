import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function XPGain({ xp }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      ref.current,
      { y: 30, opacity: 0, scale: 0.6 },
      { y: -30, opacity: 1, scale: 1.2, duration: 0.5, ease: "back.out(2)" },
    ).to(ref.current, { y: -80, opacity: 0, duration: 0.6, ease: "power2.in" });
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-24 left-1/2 -translate-x-1/2 text-green-500 font-extrabold text-2xl md:text-3xl pointer-events-none z-50"
    >
      +{xp} XP ⭐
    </div>
  );
}
