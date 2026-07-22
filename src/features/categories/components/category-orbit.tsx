"use client";

import { CategoryIcon } from "@/src/shared/components/category-icon";
import { withCategoryPalette } from "@/src/shared/lib/category-colors";
import { formatCurrency } from "@/src/shared/lib/format";
import type { CategorySummary, Currency } from "@/src/types/transaction";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";

interface CategoryOrbitProps {
  categories: CategorySummary[];
  currency: Currency;
}

/**
 * True floating 3D orbit — pure-glass category orbs travel a circular
 * path AROUND the center platform: below → side → behind → side → below.
 * The path is wide enough that nothing ever touches the center orb or
 * the platform rings. Front objects grow and brighten; rear objects
 * recede softly — always colorful, always readable.
 */

const spring = { type: "spring" as const, stiffness: 190, damping: 24 };

/** Orbital geometry. The path is a TRUE CIRCLE in pixels. */
const ORBIT_R = 0.34; // keeps every satellite within the shared 16px gutters
const CENTER_Y = 0.452; // vertical center of the orbit path (fraction of height)
const SATELLITE_SIZE = 54; // uniform orb size — every satellite is equal
const BASE_SPEED = 0.1; // rad/s — one revolution ≈ 63s
const ASPECT = "10 / 10.9"; // container aspect ratio
const RY_FRAC = ORBIT_R * (10 / 10.9); // circle radius as a fraction of height

/** Pure-glass orb — bright translucent color, crisp rim, clean glow. */
function orbStyle(color: string, dominant: boolean) {
  return {
    background: `
      radial-gradient(circle at 34% 26%, rgba(255,255,255,0.42), transparent 52%),
      radial-gradient(circle at 50% 55%, color-mix(in srgb, ${color} ${dominant ? 70 : 56}%, rgba(16,14,36,0.25)) 62%, color-mix(in srgb, ${color} 32%, rgba(10,9,26,0.40)))
    `,
    border: `1.5px solid color-mix(in srgb, ${color} ${dominant ? 88 : 72}%, transparent)`,
    boxShadow: `
      inset 0 1px 2px rgba(255,255,255,0.38),
      inset 0 -8px 18px rgba(0,0,0,0.22),
      0 0 ${dominant ? 50 : 32}px color-mix(in srgb, ${color} ${dominant ? 56 : 42}%, transparent),
      0 10px 24px rgba(0,0,0,0.30)
    `,
  };
}

export const CategoryOrbit = memo(function CategoryOrbit({ categories, currency }: CategoryOrbitProps) {
  const reduced = useReducedMotion();
  // Palette colors by spend rank — data carries content only; a category
  // added or removed later is colored automatically.
  const sorted = withCategoryPalette(
    [...categories].sort((a, b) => b.amount - a.amount)
  );

  // arrangement[0] = center platform; the rest orbit as satellites.
  const [arrangement, setArrangement] = useState<string[]>(() =>
    sorted.map((c) => c.id)
  );

  useEffect(() => {
    setArrangement((prev) => {
      const validIds = new Set(sorted.map((c) => c.id));
      const kept = prev.filter((id) => validIds.has(id));
      const missing = sorted
        .map((c) => c.id)
        .filter((id) => !kept.includes(id));
      const next = [...kept, ...missing];
      return next.length > 0 ? next : sorted.map((c) => c.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const byId = new Map(sorted.map((c) => [c.id, c]));
  const center = byId.get(arrangement[0]) ?? sorted[0];
  // Every category orbits — newly added categories join automatically.
  const satellites = arrangement
    .slice(1, 13)
    .map((id) => byId.get(id))
    .filter(Boolean) as CategorySummary[];

  // ── Orbit engine (rAF + direct style writes, zero re-renders) ────────
  const containerRef = useRef<HTMLDivElement>(null);
  const satRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const angleRef = useRef(Math.PI / 2);
  const speedRef = useRef(1);
  const hoveringRef = useRef(false);
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!isActiveRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Ease rotation speed toward target (crawl while hovering)
      const targetSpeed = hoveringRef.current ? 0.14 : 1;
      speedRef.current +=
        (targetSpeed - speedRef.current) * Math.min(dt * 4, 1);
      angleRef.current += dt * BASE_SPEED * speedRef.current;

      const el = containerRef.current;
      if (!el) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      const r = ORBIT_R * w; // true circle radius in px
      const n = satRefs.current.length;
      const t = now / 1000;

      for (let i = 0; i < n; i++) {
        const node = satRefs.current[i];
        if (!node) continue;
        const a = angleRef.current + (i * Math.PI * 2) / n;
        const sin = Math.sin(a);
        const depth = (sin + 1) / 2; // 0 = rear (top), 1 = front (bottom)
        const bob = Math.sin(t * 0.9 + i * 1.7) * 2.5; // gentle independent float
        const x = w / 2 + Math.cos(a) * r;
        const y = h * CENTER_Y + sin * r + bob;
        const scale = 0.82 + depth * 0.24;
        const opacity = 1;
        node.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
        node.style.opacity = String(opacity);
        node.style.zIndex = depth > 0.55 ? "30" : "5";
        const label = labelRefs.current[i];
        if (label) label.style.opacity = "1";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, satellites.length]);

  // Pause when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isActiveRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Pause when tab is inactive
  useEffect(() => {
    const handleVisibility = () => {
      isActiveRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ── Micro parallax ──────────────────────────────────────────────────
  const parallaxX = useSpring(0, { stiffness: 60, damping: 18 });
  const parallaxY = useSpring(0, { stiffness: 60, damping: 18 });

  function promote(id: string) {
    setArrangement((prev) => {
      const i = prev.indexOf(id);
      if (i <= 0) return prev;
      const next = [...prev];
      // Swap: tapped satellite takes the platform; center joins the orbit.
      [next[0], next[i]] = [next[i], next[0]];
      return next;
    });
  }

  if (!center) {
    return (
      <div className="glass mb-6 flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
        <p className="text-sm font-semibold">No categories yet</p>
        <p className="text-xs text-muted-foreground">
          Add a transaction and its category will appear on the orbit.
        </p>
      </div>
    );
  }

  // Static fallback positions (reduced motion): same circle, frozen.
  const frozen = satellites.map((_, i) => {
    const a = Math.PI / 2 + (i * Math.PI * 2) / satellites.length;
    const depth = (Math.sin(a) + 1) / 2;
    return {
      left: `${50 + Math.cos(a) * ORBIT_R * 100}%`,
      top: `${(CENTER_Y + Math.sin(a) * RY_FRAC) * 100}%`,
      depth,
    };
  });

  return (
    <div
      ref={containerRef}
      className="relative mx-auto mb-6 w-full max-w-full overflow-hidden"
      style={
        {
          aspectRatio: ASPECT,
          "--haze-color": `color-mix(in srgb, ${center.color} 12%, transparent)`,
        } as React.CSSProperties
      }
      onPointerEnter={() => (hoveringRef.current = true)}
      onPointerLeave={() => {
        hoveringRef.current = false;
        parallaxX.set(0);
        parallaxY.set(0);
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        parallaxX.set(((e.clientX - rect.left) / rect.width - 0.5) * 12);
        parallaxY.set(((e.clientY - rect.top) / rect.height - 0.5) * 9);
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: parallaxX, y: parallaxY }}
      >
        {/* Orbit guide ring — a clean circle the satellites travel on.
            Sits clear of the center orb and the platform rings. */}
        <div
          aria-hidden="true"
          className="border-white/12 absolute left-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            top: `${CENTER_Y * 100}%`,
            boxShadow:
              "inset 0 0 40px rgba(124,60,255,0.08), 0 0 24px rgba(124,60,255,0.06)",
          }}
        />
        {/* Traveling light points on the ring */}
        {!reduced && (
          <>
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${CENTER_Y * 100}%` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              <span
                className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-bright"
                style={{ boxShadow: "0 0 8px #9b5cff, 0 0 16px #9b5cff88" }}
              />
            </motion.div>
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${CENTER_Y * 100}%` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 27, repeat: Infinity, ease: "linear" }}
            >
              <span
                className="absolute left-0 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-info"
                style={{ boxShadow: "0 0 8px #14d9ff, 0 0 14px #14d9ff88" }}
              />
            </motion.div>
          </>
        )}

        {/* ============ CENTER — thick glass platform + dominant orb ============ */}
        <div
          className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ top: `${CENTER_Y * 100}%` }}
        >
          <div className="relative flex flex-col items-center">
            {/* Thick platform — layered slab with a visible side face */}
            <div
              aria-hidden="true"
              className="absolute -bottom-10 left-1/2 -translate-x-1/2"
              style={{ width: 220, height: 70 }}
            >
              <div
                className="absolute inset-x-2 bottom-0 top-4 rounded-[50%] transition-colors duration-500"
                style={{
                  background: `linear-gradient(180deg, color-mix(in srgb, ${center.color} 30%, rgba(10,8,26,0.9)), rgba(6,5,18,0.95))`,
                  boxShadow: "0 12px 26px rgba(0,0,0,0.55)",
                }}
              />
              <div
                className="absolute inset-x-2 bottom-4 top-1 rounded-[50%] border transition-colors duration-500"
                style={{
                  borderColor: `color-mix(in srgb, ${center.color} 55%, transparent)`,
                  background: `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, ${center.color} 24%, rgba(20,16,48,0.9)), rgba(12,10,30,0.85))`,
                  boxShadow: `0 0 30px color-mix(in srgb, ${center.color} 26%, transparent), inset 0 1px 0 rgba(255,255,255,0.16)`,
                }}
              />
              <div
                className="absolute inset-x-9 bottom-6 top-3.5 rounded-[50%] border transition-colors duration-500"
                style={{
                  borderColor: `color-mix(in srgb, ${center.color} 32%, transparent)`,
                }}
              />
              <div
                className="absolute -inset-x-4 -bottom-2 top-6 rounded-[50%] transition-colors duration-500"
                style={{
                  background: `radial-gradient(ellipse at center, color-mix(in srgb, ${center.color} 34%, transparent), transparent 70%)`,
                }}
              />
            </div>

            <motion.button
              key={center.id}
              layoutId={`orbit-${center.id}`}
              transition={spring}
              type="button"
              aria-label={`${center.name}, selected category, ${formatCurrency(center.amount, currency)}, ${center.percent}% of total`}
              className="relative flex size-40 flex-col items-center justify-center gap-0.5 rounded-full focus-visible:outline-2 focus-visible:outline-ring"
              style={orbStyle(center.color, true)}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-[60%] rounded-full"
                style={{
                  background: `radial-gradient(circle, color-mix(in srgb, ${center.color} 48%, transparent), transparent 70%)`,
                }}
              />
              <motion.span
                animate={reduced ? undefined : { y: [0, -3, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative flex size-12 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(160deg, color-mix(in srgb, ${center.color} 62%, transparent), color-mix(in srgb, ${center.color} 22%, transparent))`,
                  boxShadow: `inset 0 1px 1px rgba(255,255,255,0.28), 0 6px 16px rgba(0,0,0,0.45)`,
                  color: "#fdfdff",
                }}
              >
                <CategoryIcon name={center.icon} className="size-5.5" />
              </motion.span>
              <span className="relative text-sm font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                {center.name}
              </span>
              <span className="relative text-sm font-extrabold tabular-nums text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                {formatCurrency(center.amount, currency)}
              </span>
              <span
                className="relative text-xs font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                style={{ color: center.color }}
              >
                {center.percent}%
              </span>
            </motion.button>
          </div>
        </div>

        {/* ============ SATELLITES — circular orbit, nothing touches center ============ */}
        {satellites.map((cat, i) => {
          const slot = frozen[i];
          return (
            <div
              key={cat.id}
              ref={(el) => {
                satRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 flex flex-col items-center"
              style={
                reduced
                  ? {
                    left: slot.left,
                    top: slot.top,
                    transform: `translate(-50%, -50%) scale(${0.82 + slot.depth * 0.24})`,
                    opacity: 0.66 + slot.depth * 0.34,
                    zIndex: slot.depth > 0.55 ? 30 : 5,
                  }
                  : { transform: "translate(-50%, -50%)", opacity: 0 }
              }
            >
              <motion.button
                layoutId={`orbit-${cat.id}`}
                transition={spring}
                type="button"
                onClick={() => promote(cat.id)}
                aria-label={`Select ${cat.name}: ${formatCurrency(cat.amount, currency)}, ${cat.percent}% of total`}
                className="flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
                style={{
                  width: SATELLITE_SIZE,
                  height: SATELLITE_SIZE,
                  ...orbStyle(cat.color, false),
                }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    filter: 'none',
                  }}
                >
                  <CategoryIcon name={cat.icon} className="size-5.5" />
                </span>
              </motion.button>
              <div
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="pointer-events-none mt-1 flex flex-col items-center transition-opacity duration-300"
                style={
                  reduced
                    ? { opacity: 0.55 + slot.depth * 0.45 }
                    : { opacity: 0 }
                }
              >
                <p className="max-w-24 truncate text-center text-xs font-bold text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] max-[359px]:hidden">
                  {cat.name}
                </p>
                <p className="text-foreground/85 text-xs font-bold tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                  {formatCurrency(cat.amount, currency)}
                </p>
                <p
                  className="text-[11px] font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                  style={{ color: cat.color }}
                >
                  {cat.percent}%
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
});
