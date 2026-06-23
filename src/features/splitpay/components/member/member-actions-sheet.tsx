"use client"

import { motion, AnimatePresence } from "framer-motion"
import { UserMinus, Edit2, MessageCircle, X } from "lucide-react"
import { sheetEnter, sheetBackdrop, springs } from "@/src/features/splitpay/motions/motion"
import type { GroupPageMember } from "../../types"

interface Action {
    id: string
    label: string
    icon: React.ReactNode
    color: string
    danger?: boolean
}

const ACTIONS: Action[] = [
    { id: "message", label: "Send Message", icon: <MessageCircle size={16} strokeWidth={1.8} />, color: "#8B5CF6" },
    { id: "edit-role", label: "Change Role", icon: <Edit2 size={16} strokeWidth={1.8} />, color: "#00E5C3" },
    { id: "remove", label: "Remove Member", icon: <UserMinus size={16} strokeWidth={1.8} />, color: "#FF5470", danger: true },
]

interface MemberActionsSheetProps {
    member: GroupPageMember | null
    open: boolean
    onClose: () => void
}

export function MemberActionsSheet({ member, open, onClose }: MemberActionsSheetProps) {
    return (
        <AnimatePresence>
            {open && member && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        variants={sheetBackdrop}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-0 z-50"
                        style={{ background: "rgba(5,8,22,0.75)", backdropFilter: "blur(8px)" }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        variants={sheetEnter}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-[28px] overflow-hidden"
                        style={{
                            background: "rgba(14,10,30,0.97)",
                            backdropFilter: "blur(40px)",
                            WebkitBackdropFilter: "blur(40px)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderBottom: "none",
                            boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
                            paddingBottom: "env(safe-area-inset-bottom, 24px)",
                        }}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-4">
                            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.18)" }} />
                        </div>

                        {/* Member info */}
                        <div className="flex items-center gap-3 px-5 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                            <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                    width: "46px",
                                    height: "46px",
                                    fontSize: "22px",
                                    background: "rgba(255,255,255,0.07)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                }}
                            >
                                {member.emoji}
                            </div>
                            <div>
                                <p style={{ fontSize: "15px", fontWeight: "600", color: "#F9FAFB" }}>{member.name}</p>
                                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", marginTop: "2px" }}>
                                    {member.role === "admin" ? "Group Admin" : "Member"}
                                </p>
                            </div>
                            <motion.button
                                onClick={onClose}
                                className="ml-auto flex items-center justify-center rounded-full"
                                style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)" }}
                                whileTap={{ scale: 0.90 }}
                                transition={springs.snappy}
                            >
                                <X size={15} />
                            </motion.button>
                        </div>

                        {/* Actions */}
                        <div className="py-3">
                            {ACTIONS.map((action, i) => (
                                <motion.button
                                    key={action.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 + i * 0.05, ...springs.gentle }}
                                    className="w-full flex items-center gap-4 px-5 py-4"
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                    whileTap={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                                    onClick={() => { console.log(action.id, member.id); onClose() }}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-[10px]"
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            background: `${action.color}18`,
                                            border: `1px solid ${action.color}28`,
                                            color: action.color,
                                        }}
                                    >
                                        {action.icon}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                            color: action.danger ? action.color : "#F9FAFB",
                                        }}
                                    >
                                        {action.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}