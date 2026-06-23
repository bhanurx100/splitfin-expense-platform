"use client"

import { motion } from "framer-motion"
import { UserPlus } from "lucide-react"
import { staggerContainer, staggerItem, springs } from "@/src/features/splitpay/motions/motion"
import { MemberCard } from "./member-card"
import type { GroupPageMember } from "../../types"

interface MemberListProps {
    members: GroupPageMember[]
    currencySymbol: string
    onAddMember?: () => void
    onMemberAction?: (member: GroupPageMember) => void
}

export function MemberList({
    members,
    currencySymbol,
    onAddMember,
    onMemberAction,
}: MemberListProps) {
    return (
        <div className="px-5 pt-2 pb-6">
            {/* Add Member button */}
            <motion.button
                onClick={onAddMember}
                className="w-full flex items-center justify-center gap-2 mb-5 rounded-[16px] font-semibold"
                style={{
                    height: "50px",
                    background: "linear-gradient(135deg, #8B5CF6, #FF0A7A)",
                    boxShadow: "0 4px 20px rgba(139,92,246,0.35), 0 2px 8px rgba(0,0,0,0.3)",
                    color: "#fff",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01, boxShadow: "0 6px 28px rgba(139,92,246,0.50)" }}
                transition={springs.snappy}
            >
                <UserPlus size={17} strokeWidth={2.2} />
                + Add Member
            </motion.button>

            {/* Member cards staggered */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col gap-3"
            >
                {members.map((member) => (
                    <motion.div key={member.id} variants={staggerItem}>
                        <MemberCard
                            member={member}
                            currencySymbol={currencySymbol}
                            onActionPress={onMemberAction}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Footer note */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-5"
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)" }}
            >
                Only group members can see details and expenses.
            </motion.p>
        </div>
    )
}