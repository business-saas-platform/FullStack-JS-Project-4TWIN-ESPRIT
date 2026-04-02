// Mock data for the Business Management SaaS Platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: "platform_admin" | "business_owner" | "business_admin" | "accountant" | "team_member";
  avatar?: string;
  businessId: string;
  businessIds?: string[]; // Multiple businesses for business owners
}

export interface Business {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  taxRate: number;
  createdAt: string;
  ownerId: string;
  status: "active" | "suspended" | "trial";
  plan: "starter" | "professional" | "enterprise";
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  lineItems: InvoiceLineItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  receipt?: string;
  submittedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "business_owner" | "business_admin" | "accountant" | "team_member";
  permissions: string[];
  status: "active" | "invited" | "inactive";
  joinedAt: string;
  avatar?: string;
}

// Platform usage tracking
export interface UsageStats {
  businessId: string;
  date: string;
  totalLoginTime: number; // in minutes
  activeUsers: number;
  invoicesCreated: number;
  expensesSubmitted: number;
  apiCalls: number;
}

// AI Insights
export interface AIInsight {
  id: string;
  type: "prediction" | "recommendation" | "warning" | "opportunity";
  category: "cash_flow" | "expenses" | "revenue" | "clients" | "team";
  title: string;
  description: string;
  confidence: number; // 0-100
  createdAt: string;
  actionable: boolean;
  action?: string;
}

// Mock current user
export const currentUser: User = {
  id: "user-1",
  name: "Ahmed Ben Ali",
  email: "ahmed@business.tn",
  role: "business_owner",
  businessId: "business-1",
  businessIds: ["business-1", "business-2", "business-3"],
};

// Mock platform admin user
export const platformAdminUser: User = {
  id: "admin-1",
  name: "Platform Admin",
  email: "admin@platform.tn",
  role: "platform_admin",
  businessId: "platform",
};

// Mock businesses (expanded)
export const allBusinesses: Business[] = [
  {
    id: "business-1",
    name: "Tech Solutions Tunisia",
    address: "123 Avenue Habib Bourguiba, Tunis 1000, Tunisia",
    phone: "+216 71 123 456",
    email: "contact@techsolutions.tn",
    taxId: "TN123456789",
    currency: "TND",
    taxRate: 19,
    createdAt: "2024-01-15T10:00:00Z",
    ownerId: "user-1",
    status: "active",
    plan: "professional",
  },
  {
    id: "business-2",
    name: "Digital Marketing Agency",
    address: "456 Rue de la République, Sfax 3000, Tunisia",
    phone: "+216 74 234 567",
    email: "contact@digitalagency.tn",
    taxId: "TN234567890",
    currency: "TND",
    taxRate: 19,
    createdAt: "2025-06-20T10:00:00Z",
    ownerId: "user-1",
    status: "active",
    plan: "starter",
  },
  {
    id: "business-3",
    name: "Consulting Pro",
    address: "789 Avenue de la Liberté, Sousse 4000, Tunisia",
    phone: "+216 73 345 678",
    email: "contact@consultingpro.tn",
    taxId: "TN345678901",
    currency: "TND",
    taxRate: 19,
    createdAt: "2025-11-10T10:00:00Z",
    ownerId: "user-1",
    status: "active",
    plan: "enterprise",
  },
  {
    id: "business-4",
    name: "Import Export Co",
    address: "321 Boulevard du 7 Novembre, Tunis 1002, Tunisia",
    phone: "+216 71 456 789",
    email: "contact@importexport.tn",
    taxId: "TN456789012",
    currency: "TND",
    taxRate: 19,
    createdAt: "2025-03-15T10:00:00Z",
    ownerId: "user-6",
    status: "active",
    plan: "professional",
  },
  {
    id: "business-5",
    name: "Restaurant Chain Tunisia",
    address: "654 Avenue Habib Thameur, Tunis 1005, Tunisia",
    phone: "+216 71 567 890",
    email: "contact@restaurant.tn",
    taxId: "TN567890123",
    currency: "TND",
    taxRate: 19,
    createdAt: "2025-08-22T10:00:00Z",
    ownerId: "user-7",
    status: "trial",
    plan: "starter",
  },
  {
    id: "business-6",
    name: "Construction & Build",
    address: "987 Rue Ibn Khaldoun, Bizerte 7000, Tunisia",
    phone: "+216 72 678 901",
    email: "contact@construction.tn",
    taxId: "TN678901234",
    currency: "TND",
    taxRate: 19,
    createdAt: "2024-12-05T10:00:00Z",
    ownerId: "user-8",
    status: "suspended",
    plan: "professional",
  },
];

// Mock business (current)
export const currentBusiness: Business = allBusinesses[0];

// Mock business owners for platform admin
export const businessOwners = [
  {
    id: "user-1",
    name: "Ahmed Ben Ali",
    email: "ahmed@business.tn",
    businessCount: 3,
    totalRevenue: 142850.0,
    joinedAt: "2024-01-15T10:00:00Z",
    lastActive: "2026-02-04T08:30:00Z",
    status: "active" as const,
  },
  {
    id: "user-6",
    name: "Karim Mahjoub",
    email: "karim@business.tn",
    businessCount: 1,
    totalRevenue: 89600.0,
    joinedAt: "2025-03-15T10:00:00Z",
    lastActive: "2026-02-03T18:45:00Z",
    status: "active" as const,
  },
  {
    id: "user-7",
    name: "Salma Benhadj",
    email: "salma@business.tn",
    businessCount: 1,
    totalRevenue: 0,
    joinedAt: "2025-08-22T10:00:00Z",
    lastActive: "2026-02-04T07:15:00Z",
    status: "trial" as const,
  },
  {
    id: "user-8",
    name: "Riadh Trabelsi",
    email: "riadh@business.tn",
    businessCount: 1,
    totalRevenue: 234500.0,
    joinedAt: "2024-12-05T10:00:00Z",
    lastActive: "2026-01-20T12:00:00Z",
    status: "suspended" as const,
  },
];

// Mock usage statistics
export const mockUsageStats: UsageStats[] = [
  {
    businessId: "business-1",
    date: "2026-02-03",
    totalLoginTime: 245,
    activeUsers: 5,
    invoicesCreated: 3,
    expensesSubmitted: 2,
    apiCalls: 1250,
  },
  {
    businessId: "business-1",
    date: "2026-02-02",
    totalLoginTime: 312,
    activeUsers: 4,
    invoicesCreated: 2,
    expensesSubmitted: 5,
    apiCalls: 1580,
  },
  {
    businessId: "business-4",
    date: "2026-02-03",
    totalLoginTime: 189,
    activeUsers: 3,
    invoicesCreated: 5,
    expensesSubmitted: 1,
    apiCalls: 980,
  },
  {
    businessId: "business-5",
    date: "2026-02-03",
    totalLoginTime: 67,
    activeUsers: 1,
    invoicesCreated: 0,
    expensesSubmitted: 0,
    apiCalls: 145,
  },
];

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    id: "ai-1",
    type: "prediction",
    category: "cash_flow",
    title: "Positive Cash Flow Expected Next Month",
    description: "Based on current invoice patterns and payment history, you're projected to have 15% better cash flow in March 2026 compared to February.",
    confidence: 87,
    createdAt: "2026-02-04T06:00:00Z",
    actionable: false,
  },
  {
    id: "ai-2",
    type: "warning",
    category: "expenses",
    title: "Software Expenses Increased by 35%",
    description: "Your software-related expenses have increased significantly in the last 30 days. Review subscriptions to identify unused services.",
    confidence: 92,
    createdAt: "2026-02-03T12:00:00Z",
    actionable: true,
    action: "Review software expenses",
  },
  {
    id: "ai-3",
    type: "recommendation",
    category: "clients",
    title: "Follow Up With Global Trade Inc",
    description: "Invoice INV-2026-002 is overdue by 6 days. Client typically pays within 3 days. Sending a reminder could expedite payment.",
    confidence: 78,
    createdAt: "2026-02-04T08:00:00Z",
    actionable: true,
    action: "Send payment reminder",
  },
  {
    id: "ai-4",
    type: "opportunity",
    category: "revenue",
    title: "Upsell Opportunity: Digital Marketing Pro",
    description: "This client has increased project scope by 40% over the last quarter. Consider proposing a retainer agreement.",
    confidence: 74,
    createdAt: "2026-02-03T09:30:00Z",
    actionable: true,
    action: "Draft proposal",
  },
  {
    id: "ai-5",
    type: "prediction",
    category: "team",
    title: "Team Productivity at Peak Levels",
    description: "Current team performance metrics show 23% higher efficiency compared to last month. Great work!",
    confidence: 85,
    createdAt: "2026-02-04T07:00:00Z",
    actionable: false,
  },
];

// Mock clients
export const mockClients: Client[] = [
  {
    id: "client-1",
    name: "Global Trade Inc",
    email: "contact@globaltrade.com",
    phone: "+216 71 234 567",
    address: "456 Rue de la République, Tunis 1001, Tunisia",
    taxId: "TN987654321",
    totalInvoiced: 45750.00,
    totalPaid: 32500.00,
    outstandingBalance: 13250.00,
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "client-2",
    name: "Digital Marketing Pro",
    email: "info@digitalmarketing.tn",
    phone: "+216 71 345 678",
    address: "789 Avenue de la Liberté, Tunis 1002, Tunisia",
    taxId: "TN456789123",
    totalInvoiced: 28900.00,
    totalPaid: 28900.00,
    outstandingBalance: 0,
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "client-3",
    name: "Consulting Partners",
    email: "contact@consulting.tn",
    phone: "+216 71 456 789",
    address: "321 Boulevard de France, Tunis 1003, Tunisia",
    totalInvoiced: 67200.00,
    totalPaid: 50400.00,
    outstandingBalance: 16800.00,
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "client-4",
    name: "E-Commerce Solutions",
    email: "hello@ecommerce.tn",
    phone: "+216 71 567 890",
    address: "654 Rue d'Alger, Tunis 1004, Tunisia",
    taxId: "TN789123456",
    totalInvoiced: 12300.00,
    totalPaid: 12300.00,
    outstandingBalance: 0,
    createdAt: "2024-04-05T10:00:00Z",
  },
];

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    clientId: "client-1",
    clientName: "Global Trade Inc",
    issueDate: "2026-02-01",
    dueDate: "2026-03-01",
    status: "paid",
    subtotal: 12500.00,
    taxAmount: 2375.00,
    total: 14875.00,
    paidAmount: 14875.00,
    lineItems: [
      {
        id: "item-1",
        description: "Web Application Development",
        quantity: 100,
        unitPrice: 100.00,
        amount: 10000.00,
      },
      {
        id: "item-2",
        description: "UI/UX Design Services",
        quantity: 50,
        unitPrice: 50.00,
        amount: 2500.00,
      },
    ],
    notes: "Payment received via bank transfer",
    createdBy: "user-1",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-002",
    clientId: "client-2",
    clientName: "Digital Marketing Pro",
    issueDate: "2026-01-28",
    dueDate: "2026-02-28",
    status: "overdue",
    subtotal: 8400.00,
    taxAmount: 1596.00,
    total: 9996.00,
    paidAmount: 0,
    lineItems: [
      {
        id: "item-3",
        description: "SEO Optimization",
        quantity: 60,
        unitPrice: 80.00,
        amount: 4800.00,
      },
      {
        id: "item-4",
        description: "Content Management",
        quantity: 40,
        unitPrice: 90.00,
        amount: 3600.00,
      },
    ],
    createdBy: "user-1",
    createdAt: "2026-01-28T10:00:00Z",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-003",
    clientId: "client-3",
    clientName: "Consulting Partners",
    issueDate: "2026-02-03",
    dueDate: "2026-03-03",
    status: "sent",
    subtotal: 16800.00,
    taxAmount: 3192.00,
    total: 19992.00,
    paidAmount: 0,
    lineItems: [
      {
        id: "item-5",
        description: "Business Consulting",
        quantity: 120,
        unitPrice: 120.00,
        amount: 14400.00,
      },
      {
        id: "item-6",
        description: "Technical Documentation",
        quantity: 30,
        unitPrice: 80.00,
        amount: 2400.00,
      },
    ],
    createdBy: "user-1",
    createdAt: "2026-02-03T10:00:00Z",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-004",
    clientId: "client-4",
    clientName: "E-Commerce Solutions",
    issueDate: "2026-01-30",
    dueDate: "2026-03-01",
    status: "paid",
    subtotal: 5600.00,
    taxAmount: 1064.00,
    total: 6664.00,
    paidAmount: 6664.00,
    lineItems: [
      {
        id: "item-7",
        description: "E-Commerce Platform Setup",
        quantity: 40,
        unitPrice: 100.00,
        amount: 4000.00,
      },
      {
        id: "item-8",
        description: "Payment Gateway Integration",
        quantity: 20,
        unitPrice: 80.00,
        amount: 1600.00,
      },
    ],
    notes: "Payment received via credit card",
    createdBy: "user-1",
    createdAt: "2026-01-30T10:00:00Z",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2026-005",
    clientId: "client-1",
    clientName: "Global Trade Inc",
    issueDate: "2026-02-02",
    dueDate: "2026-03-04",
    status: "draft",
    subtotal: 7200.00,
    taxAmount: 1368.00,
    total: 8568.00,
    paidAmount: 0,
    lineItems: [
      {
        id: "item-9",
        description: "Mobile App Development",
        quantity: 60,
        unitPrice: 120.00,
        amount: 7200.00,
      },
    ],
    createdBy: "user-1",
    createdAt: "2026-02-02T10:00:00Z",
  },
];

// Mock expenses
export const mockExpenses: Expense[] = [
  {
    id: "exp-1",
    category: "Software",
    description: "Adobe Creative Cloud Subscription",
    amount: 249.00,
    date: "2026-02-01",
    status: "approved",
    submittedBy: "user-2",
    approvedBy: "user-1",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "exp-2",
    category: "Office Supplies",
    description: "Office Furniture and Equipment",
    amount: 1250.00,
    date: "2026-01-28",
    status: "approved",
    submittedBy: "user-3",
    approvedBy: "user-1",
    createdAt: "2026-01-28T10:00:00Z",
  },
  {
    id: "exp-3",
    category: "Marketing",
    description: "Google Ads Campaign",
    amount: 850.00,
    date: "2026-02-02",
    status: "pending",
    submittedBy: "user-4",
    createdAt: "2026-02-02T10:00:00Z",
  },
  {
    id: "exp-4",
    category: "Travel",
    description: "Client Meeting - Transportation",
    amount: 120.00,
    date: "2026-01-30",
    status: "approved",
    submittedBy: "user-2",
    approvedBy: "user-1",
    createdAt: "2026-01-30T10:00:00Z",
  },
  {
    id: "exp-5",
    category: "Software",
    description: "GitHub Enterprise License",
    amount: 399.00,
    date: "2026-02-03",
    status: "pending",
    submittedBy: "user-5",
    createdAt: "2026-02-03T10:00:00Z",
  },
];

// Mock team members
export const mockTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "Ahmed Ben Ali",
    email: "ahmed@business.tn",
    role: "business_owner",
    permissions: ["all"],
    status: "active",
    joinedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Fatima Trabelsi",
    email: "fatima@business.tn",
    role: "accountant",
    permissions: ["invoices", "expenses", "reports", "clients"],
    status: "active",
    joinedAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "user-3",
    name: "Mohamed Kacem",
    email: "mohamed@business.tn",
    role: "business_admin",
    permissions: ["invoices", "expenses", "clients", "team"],
    status: "active",
    joinedAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "user-4",
    name: "Leila Gharbi",
    email: "leila@business.tn",
    role: "team_member",
    permissions: ["invoices", "clients"],
    status: "active",
    joinedAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "user-5",
    name: "Youssef Mansour",
    email: "youssef@business.tn",
    role: "team_member",
    permissions: ["expenses"],
    status: "invited",
    joinedAt: "2024-04-01T10:00:00Z",
  },
];

// Expense categories
export const expenseCategories = [
  "Software",
  "Office Supplies",
  "Marketing",
  "Travel",
  "Utilities",
  "Equipment",
  "Professional Services",
  "Rent",
  "Insurance",
  "Other",
];

// Role labels
export const roleLabels: Record<string, string> = {
  platform_admin: "Platform Administrator",
  business_owner: "Business Owner",
  business_admin: "Business Administrator",
  accountant: "Accountant",
  team_member: "Team Member",
};