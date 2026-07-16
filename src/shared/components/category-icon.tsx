'use client'

import {
  BookOpen,
  Briefcase,
  Car,
  FileText,
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
  Utensils,
  Wallet,
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
