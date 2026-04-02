export interface Business {
  id: string;
  name: string;
  logo?: string;
  type: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  fiscalYearStart: string;
  industry: string;
  taxRate: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "platform_admin" | "business_owner" | "business_admin" | "accountant" | "team_member" | "client";
  avatar?: string;
  businessId?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  taxId?: string;
  type: "individual" | "company";
  status: "active" | "inactive";
  totalRevenue: number;
  outstandingBalance: number;
  createdAt: string;
  lastContactDate?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  notes?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Expense {
  id: string;
  businessId: string;
  date: string;
  amount: number;
  currency: string;
  category: string;
  vendor: string;
  description: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected";
  receiptUrl?: string;
  submittedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: "business_owner" | "business_admin" | "accountant" | "team_member";
  avatar?: string;
  phone?: string;
  status: "active" | "inactive" | "invited";
  permissions: string[];
  joinedAt: string;
  lastActive?: string;
}

export interface AIInsight {
  id: string;
  type: "prediction" | "warning" | "recommendation" | "opportunity";
  category: "revenue" | "expenses" | "clients" | "cash_flow" | "invoices";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  action?: string;
  impact?: "high" | "medium" | "low";
  createdAt: string;
}

// Mock Data
export const mockBusinesses: Business[] = [
  {
    id: "b1",
    name: "Tech Solutions SARL",
    type: "SARL",
    address: "Avenue Habib Bourguiba",
    city: "Tunis",
    country: "Tunisia",
    taxId: "1234567A",
    phone: "+216 71 123 456",
    email: "contact@techsolutions.tn",
    website: "https://techsolutions.tn",
    currency: "TND",
    fiscalYearStart: "2024-01-01",
    industry: "Technology",
    taxRate: 19
  },
  {
    id: "b2",
    name: "Digital Marketing Agency",
    type: "SUARL",
    address: "Rue de la Liberté",
    city: "Sfax",
    country: "Tunisia",
    taxId: "7654321B",
    phone: "+216 74 987 654",
    email: "hello@digitalagency.tn",
    currency: "TND",
    fiscalYearStart: "2024-01-01",
    industry: "Marketing",
    taxRate: 19
  }
];

export const mockClients: Client[] = [
  {
    id: "c1",
    businessId: "b1",
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+216 71 234 567",
    address: "123 Business Street",
    city: "Tunis",
    postalCode: "1000",
    country: "Tunisia",
    taxId: "ABC123",
    type: "company",
    status: "active",
    totalRevenue: 45000,
    outstandingBalance: 5000,
    createdAt: "2024-01-15",
    lastContactDate: "2024-11-20"
  },
  {
    id: "c2",
    businessId: "b1",
    name: "Global Enterprises",
    email: "info@global.com",
    phone: "+216 71 345 678",
    address: "456 Commerce Ave",
    city: "Sousse",
    postalCode: "4000",
    country: "Tunisia",
    type: "company",
    status: "active",
    totalRevenue: 78000,
    outstandingBalance: 12000,
    createdAt: "2024-02-20",
    lastContactDate: "2024-11-18"
  },
  {
    id: "c3",
    businessId: "b2",
    name: "Startup Tunisia",
    email: "hello@startup.tn",
    phone: "+216 74 111 222",
    address: "15 Avenue du Printemps",
    city: "Sfax",
    postalCode: "3000",
    country: "Tunisia",
    type: "company",
    status: "active",
    totalRevenue: 22000,
    outstandingBalance: 3000,
    createdAt: "2024-03-10",
    lastContactDate: "2024-11-25"
  },
  {
    id: "c4",
    businessId: "b2",
    name: "E-Commerce Plus",
    email: "contact@ecommerceplus.tn",
    phone: "+216 74 333 444",
    address: "88 Boulevard de la Paix",
    city: "Sfax",
    postalCode: "3001",
    country: "Tunisia",
    type: "company",
    status: "active",
    totalRevenue: 35000,
    outstandingBalance: 8000,
    createdAt: "2024-04-15",
    lastContactDate: "2024-11-22"
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2024-001",
    businessId: "b1",
    clientId: "c1",
    clientName: "Acme Corporation",
    issueDate: "2024-11-01",
    dueDate: "2024-11-30",
    status: "paid",
    subtotal: 8000,
    taxAmount: 1520,
    totalAmount: 9520,
    paidAmount: 9520,
    currency: "TND",
    items: [
      {
        id: "item1",
        description: "Web Development Services",
        quantity: 40,
        unitPrice: 200,
        taxRate: 19,
        amount: 8000
      }
    ]
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2024-002",
    businessId: "b1",
    clientId: "c2",
    clientName: "Global Enterprises",
    issueDate: "2024-11-15",
    dueDate: "2024-12-15",
    status: "sent",
    subtotal: 12000,
    taxAmount: 2280,
    totalAmount: 14280,
    paidAmount: 0,
    currency: "TND",
    items: [
      {
        id: "item2",
        description: "Consulting Services",
        quantity: 60,
        unitPrice: 200,
        taxRate: 19,
        amount: 12000
      }
    ]
  }
];

export const mockExpenses: Expense[] = [
  {
    id: "exp1",
    businessId: "b1",
    date: "2024-11-10",
    amount: 450,
    currency: "TND",
    category: "Office Supplies",
    vendor: "Office Depot",
    description: "Printer paper and ink cartridges",
    paymentMethod: "Credit Card",
    status: "approved",
    submittedBy: "John Doe",
    approvedBy: "Jane Smith",
    createdAt: "2024-11-10"
  },
  {
    id: "exp2",
    businessId: "b1",
    date: "2024-11-12",
    amount: 1200,
    currency: "TND",
    category: "Software",
    vendor: "Adobe",
    description: "Creative Cloud subscription",
    paymentMethod: "Credit Card",
    status: "approved",
    submittedBy: "John Doe",
    createdAt: "2024-11-12"
  }
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: "tm1",
    businessId: "b1",
    name: "Ahmed Ben Salah",
    email: "ahmed@techsolutions.tn",
    role: "business_owner",
    phone: "+216 98 123 456",
    status: "active",
    permissions: ["all"],
    joinedAt: "2024-01-01",
    lastActive: "2024-11-20"
  },
  {
    id: "tm2",
    businessId: "b1",
    name: "Fatima Mansour",
    email: "fatima@techsolutions.tn",
    role: "accountant",
    phone: "+216 98 234 567",
    status: "active",
    permissions: ["invoices", "expenses", "reports"],
    joinedAt: "2024-02-15",
    lastActive: "2024-11-19"
  }
];

export const mockAIInsights: AIInsight[] = [
  {
    id: "ai1",
    type: "prediction",
    category: "revenue",
    title: "Revenue Growth Forecast",
    description: "Based on current trends, your revenue is predicted to increase by 23% next month. Consider hiring additional staff to meet demand.",
    confidence: 87,
    actionable: true,
    action: "View hiring recommendations",
    impact: "high",
    createdAt: "2024-11-20"
  },
  {
    id: "ai2",
    type: "warning",
    category: "cash_flow",
    title: "Cash Flow Alert",
    description: "3 invoices totaling 24,500 TND are overdue by more than 30 days. Consider sending payment reminders.",
    confidence: 95,
    actionable: true,
    action: "Send reminders",
    impact: "high",
    createdAt: "2024-11-19"
  },
  {
    id: "ai3",
    type: "recommendation",
    category: "expenses",
    title: "Expense Optimization",
    description: "Your software subscription costs increased by 40% this quarter. Review unused licenses to reduce costs.",
    confidence: 78,
    actionable: true,
    action: "Review subscriptions",
    impact: "medium",
    createdAt: "2024-11-18"
  },
  {
    id: "ai4",
    type: "opportunity",
    category: "clients",
    title: "Client Upsell Opportunity",
    description: "Client 'Acme Corporation' has increased their order volume by 60%. They may be interested in a premium service package.",
    confidence: 82,
    actionable: true,
    action: "Create proposal",
    impact: "high",
    createdAt: "2024-11-17"
  }
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