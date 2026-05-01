"use client";

// components/dashboard/AccountCard.tsx
// New component — shows a single account in BalanceCard visual style.
// Used on /accounts page in a grid.

import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-account";
import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Wallet } from "lucide-react";

type AccountCardProps = {
  id: string;
  name: string;
};

// Deterministic gradient per account index
const GRADIENTS = [
  "from-blue-600 via-blue-500 to-blue-400",
  "from-violet-600 via-violet-500 to-violet-400",
  "from-emerald-600 via-emerald-500 to-emerald-400",
  "from-rose-600 via-rose-500 to-rose-400",
  "from-amber-600 via-amber-500 to-amber-400",
  "from-cyan-600 via-cyan-500 to-cyan-400",
] as const;

export function AccountCard({
  id,
  name,
  index = 0,
}: AccountCardProps & { index?: number }) {
  const { onOpen } = useOpenAccount();
  const deleteMutation = useDeleteAccount(id);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete account?",
    "This will also delete all transactions linked to this account."
  );

  const gradient = GRADIENTS[index % GRADIENTS.length];

  async function handleDelete() {
    const ok = await confirm();
    if (ok) deleteMutation.mutate();
  }

  return (
    <>
      <ConfirmDialog />
      <div
        className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
      >
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <div className="relative">
          {/* Top row */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 transition-transform duration-300 group-hover:scale-110">
              <Wallet className="h-5 w-5 text-white" />
            </div>

            {/* 3-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full p-1.5 transition hover:bg-white/20"
                  aria-label="Account options"
                >
                  <MoreHorizontal className="h-4 w-4 text-white/80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-2xl">
                <DropdownMenuItem
                  onClick={() => onOpen(id)}
                  className="cursor-pointer rounded-xl"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="cursor-pointer rounded-xl text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Account name */}
          <p className="text-xs font-medium text-white/70">Account</p>
          <h3 className="mt-0.5 text-xl font-bold tracking-tight">{name}</h3>
          <p className="mt-3 text-xs text-white/40">Tap ··· to manage</p>
        </div>
      </div>
    </>
  );
}