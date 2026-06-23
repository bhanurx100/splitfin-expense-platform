"use client"

import { motion } from "framer-motion"
import type { GroupCardData } from "../../types"
import { SplitGroupCard } from "./split-group-card"

interface SplitGroupsListProps {
  groups:    GroupCardData[]
  onSeeAll?: () => void
}

export function SplitGroupsList({ groups, onSeeAll }: SplitGroupsListProps) {
  return (
    <section className="px-5">
      {/* Section header */}
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2
          className="font-bold"
          style={{ fontSize: "16px", color: "#F9FAFB" }}
        >
          Your Groups
        </h2>

        <motion.button
          onClick={onSeeAll}
          className="text-[13px] font-semibold"
          style={{
            color:      "#9F6EF5",
            background: "none",
            border:     "none",
            cursor:     "pointer",
            padding:    "4px 0",
          }}
          whileTap={{ scale: 0.94 }}
          whileHover={{ color: "#C4A8FF" }}
          transition={{ duration: 0.15 }}
          aria-label="See all groups"
        >
          See all
        </motion.button>
      </motion.div>

      {/* Group cards */}
      <div className="flex flex-col gap-3">
        {groups.map((group, index) => (
          <SplitGroupCard
            key={group.id}
            group={group}
            index={index}
          />
        ))}
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🪴</p>
          <p
            className="font-semibold"
            style={{ fontSize: "15px", color: "rgba(249,250,251,0.70)" }}
          >
            No groups yet
          </p>
          <p
            className="mt-1.5"
            style={{ fontSize: "13px", color: "rgba(249,250,251,0.38)" }}
          >
            Create a group to start splitting expenses
          </p>
        </motion.div>
      )}
    </section>
  )
}