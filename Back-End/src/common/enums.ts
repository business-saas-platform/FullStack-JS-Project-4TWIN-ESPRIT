export type UserRole =
  | "platform_admin"
  | "business_owner"
  | "business_admin"
  | "accountant"
  | "team_member"
  | "client";

export type ClientType = "individual" | "company";
export type ClientStatus = "active" | "inactive";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "cancelled";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export type TeamMemberRole =
  | "business_owner"
  | "business_admin"
  | "accountant"
  | "team_member";

export type TeamMemberStatus = "active" | "inactive" | "invited";

export type AIInsightType = "prediction" | "warning" | "recommendation" | "opportunity";
export type AIInsightCategory = "revenue" | "expenses" | "clients" | "cash_flow" | "invoices";
export type AIImpact = "high" | "medium" | "low";
