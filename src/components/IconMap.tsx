import {
  Wallet, Building2, CreditCard,
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  Zap, Droplets, Wifi, Smartphone, Tv, Flame,
  Car, HeartPulse, Banknote, Phone, FileText,
  TrendingUp, TrendingDown, DollarSign,
  PiggyBank, ClipboardList, User, ShieldCheck,
  type LucideProps
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  // Account types
  savings: PiggyBank,
  checking: Building2,
  credit: CreditCard,
  // Transaction types
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: ArrowLeftRight,
  // Payment services
  zap: Zap,
  droplets: Droplets,
  wifi: Wifi,
  smartphone: Smartphone,
  tv: Tv,
  flame: Flame,
  car: Car,
  'heart-pulse': HeartPulse,
  banknote: Banknote,
  phone: Phone,
  'file-text': FileText,
  // Stats
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'dollar-sign': DollarSign,
  wallet: Wallet,
  clipboard: ClipboardList,
  user: User,
  shield: ShieldCheck,
};

interface IconProps extends LucideProps {
  name: string;
}

export default function Icon({ name, ...props }: IconProps) {
  const Component = iconMap[name] || Wallet;
  return <Component {...props} />;
}
