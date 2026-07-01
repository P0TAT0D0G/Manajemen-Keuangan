import React from 'react';
import { 
  Briefcase, 
  Coffee, 
  Bus, 
  Film, 
  Monitor, 
  ShoppingCart, 
  Home, 
  Zap, 
  HeartPulse, 
  GraduationCap, 
  Receipt,
  HelpCircle
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  briefcase: Briefcase,
  coffee: Coffee,
  bus: Bus,
  film: Film,
  monitor: Monitor,
  cart: ShoppingCart,
  home: Home,
  zap: Zap,
  health: HeartPulse,
  education: GraduationCap,
  receipt: Receipt
};

export const getIconComponent = (iconName: string, props?: LucideProps) => {
  const Icon = iconMap[iconName] || HelpCircle;
  return <Icon {...props} />;
};

export const availableIcons = Object.keys(iconMap);
