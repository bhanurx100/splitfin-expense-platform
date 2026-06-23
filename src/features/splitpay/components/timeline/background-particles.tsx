"use client"

import { motion } from "framer-motion"
import { BACKGROUND_PARTICLES } from "@/src/features/splitpay/motions/motion"

export function BackgroundParticles() {
    return (
        <div
            className="fixed inset-0 pointer-events-none overflow-hidden"
            aria-hidden
            style={{ zIndex: 0 }}
        >
            {BACKGROUND_PARTICLES.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.x,
                        top: p.y,
                        background: p.color,
                        filter: "blur(60px)",
                        transform: "translate(-50%, -50%)",
                    }}
                    animate={{
                        x: [0, p.driftX, -p.driftX * 0.5, 0],
                        y: [0, p.driftY, -p.driftY * 0.6, 0],
                        opacity: [0.7, 1, 0.8, 0.7],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "loop",
                    }}
                />
            ))}
        </div>
    )
}