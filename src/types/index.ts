export interface SessionUser {
  email: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  documentId?: string;
  joinDate?: string;
}

export interface Account {
  id: string;
  type: 'savings' | 'checking' | 'credit';
  name: string;
  number: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'blocked';
  lastActivity: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  accountId: string;
  accountName: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  icon: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface PaymentService {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
}
