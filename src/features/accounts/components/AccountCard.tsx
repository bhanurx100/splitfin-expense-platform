"use client";

import { useOpenAccount } from "@/src/features/accounts/hooks/use-open-account";
import { useDeleteAccount } from "@/src/features/accounts/api/use-delete-account";
import { useConfirm } from "@/src/hooks/use-confirm";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Wallet } from "lucide-react";
import { cn } from "@/src/lib/utils";

type AccountCardProps = { id: string; name: string; index?: number };

const CARD_THEMES = [
  { bg: "from-blue-600/90 to-blue-800/90", ring: "ring-blue-500/20", iconBg: "bg-white/15", dot: "bg-blue-300" },
  { bg: "from-violet-600/90 to-violet-800/90", ring: "ring-violet-500/20", iconBg: "bg-white/15", dot: "bg-violet-300" },
  { bg: "from-emerald-600/90 to-emerald-800/90", ring: "ring-emerald-500/20", iconBg: "bg-white/15", dot: "bg-emerald-300" },
  { bg: "from-rose-600/90 to-rose-800/90", ring: "ring-rose-500/20", iconBg: "bg-white/15", dot: "bg-rose-300" },
  { bg: "from-amber-600/90 to-amber-800/90", ring: "ring-amber-500/20", iconBg: "bg-white/15", dot: "bg-amber-300" },
  { bg: "from-cyan-600/90 to-cyan-800/90", ring: "ring-cyan-500/20", iconBg: "bg-white/15", dot: "bg-cyan-300" },
] as const;

export function AccountCard({ id, name, index = 0 }: AccountCardProps) {
  const { onOpen } = useOpenAccount();
  const deleteMutation = useDeleteAccount(id);
  const [ConfirmDialog, confirm] = useConfirm("Delete account?", "This will also delete all transactions linked to this account.");
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  async function handleDelete() {
    const ok = await confirm();
    if (ok) deleteMutation.mutate();
  }

  return (
    <>
      <ConfirmDialog />
      <div className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br ring-1 shadow-sm text-white select-none",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        theme.bg, theme.ring,
      )}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
        <div className="relative p-4">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", theme.iconBg)}>
              <Wallet className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition-all hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)]">
                <DropdownMenuItem onClick={() => onOpen(id)} className="cursor-pointer rounded-lg text-[13px] text-[var(--text-secondary)] focus:text-[var(--text-primary)] focus:bg-[var(--surface-hover)]">
                  <Edit className="mr-2 h-3.5 w-3.5" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={deleteMutation.isPending} className="cursor-pointer rounded-lg text-[13px] text-[var(--color-expense)] focus:text-[var(--color-expense)] focus:bg-[var(--color-expense-bg)]">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/50 mb-0.5">Account</p>
            <h3 className="text-[15px] font-semibold text-white leading-tight truncate">{name}</h3>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", theme.dot)} />
            <span className="text-[11px] text-white/50 font-medium">Active</span>
          </div>
        </div>
      </div>
    </>
  );
}