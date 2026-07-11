import { theme } from './theme';
import { 
  ForkKnife, 
  ShoppingCart, 
  Car, 
  House, 
  Lightning, 
  MonitorPlay, 
  Heartbeat, 
  GraduationCap, 
  AirplaneTilt, 
  Money, 
  DotsThree,
  Briefcase,
  Gift
} from 'phosphor-react-native';

export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: any; // Phosphor icon component
  color: string;
}

export const CATEGORIES: Category[] = [
  // Expenses
  { id: 'food', name: 'Food & Dining', type: 'expense', icon: ForkKnife, color: '#F59E0B' }, // Warning color
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: ShoppingCart, color: '#8B5CF6' }, // Purple
  { id: 'transport', name: 'Transport', type: 'expense', icon: Car, color: '#3B82F6' }, // Info color
  { id: 'housing', name: 'Housing', type: 'expense', icon: House, color: '#6366F1' }, // Indigo
  { id: 'utilities', name: 'Utilities', type: 'expense', icon: Lightning, color: '#EAB308' }, // Yellow
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: MonitorPlay, color: '#EC4899' }, // Pink
  { id: 'health', name: 'Health', type: 'expense', icon: Heartbeat, color: '#EF4444' }, // Error color
  { id: 'education', name: 'Education', type: 'expense', icon: GraduationCap, color: '#10B981' }, // Emerald
  { id: 'travel', name: 'Travel', type: 'expense', icon: AirplaneTilt, color: '#0EA5E9' }, // Sky
  { id: 'other_expense', name: 'Other', type: 'expense', icon: DotsThree, color: '#9CA3AF' }, // Gray
  
  // Income
  { id: 'salary', name: 'Salary', type: 'income', icon: Briefcase, color: theme.colors.income },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: MonitorPlay, color: theme.colors.income },
  { id: 'investment', name: 'Investments', type: 'income', icon: Money, color: theme.colors.income },
  { id: 'gifts', name: 'Gifts', type: 'income', icon: Gift, color: theme.colors.income },
  { id: 'Dad money', name: 'Other', type: 'income', icon: DotsThree, color: theme.colors.income },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(c => c.id === id);
};

export const getCategoriesByType = (type: CategoryType): Category[] => {
  return CATEGORIES.filter(c => c.type === type);
};
