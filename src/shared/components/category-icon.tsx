'use client'

import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Car,
  Crown,
  FileText,
  Flame,
  Fuel,
  Heart,
  HeartPulse,
  Home,
  Landmark,
  MoreHorizontal,
  Palmtree,
  PiggyBank,
  Pizza,
  Plane,
  Play,
  Popcorn,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  'shopping-bag': ShoppingBag,
  utensils: Utensils,
  'file-text': FileText,
  car: Car,
  play: Play,
  'heart-pulse': HeartPulse,
  heart: Heart,
  'book-open': BookOpen,
  plane: Plane,
  'more-horizontal': MoreHorizontal,
  briefcase: Briefcase,
  fuel: Fuel,
  wallet: Wallet,
  landmark: Landmark,
  'piggy-bank': PiggyBank,
  palmtree: Palmtree,
  pizza: Pizza,
  home: Home,
  popcorn: Popcorn,
  crown: Crown,
  'trending-up': TrendingUp,
  flame: Flame,
  'alert-triangle': AlertTriangle,
  sparkles: Sparkles,
  zap: Zap,
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = icons[name] ?? MoreHorizontal
  return <Icon className={className} aria-hidden="true" />
}
