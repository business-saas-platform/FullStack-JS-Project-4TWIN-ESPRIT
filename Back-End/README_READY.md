# Nest SaaS Backend (Ready)
## Install
npm install
## Run (dev)
npm run start:dev

### Notes
- Added TenantMiddleware to read header `x-business-id`
- Added BusinessAccessGuard (platform_admin full access, business_owner access to owned businesses, others must match user.businessId)
- Secured clients/invoices/expenses/ai-insights with JwtAuthGuard + BusinessAccessGuard
- Removed businessId from query params; scope is now header-based.
