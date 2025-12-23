This "Zero-Cost" PMS is architected as a Serverless, Single-Page Application (SPA). It allows you to run an Enterprise-grade system without paying for servers or database subscriptions.

The "Engine" (Frontend logic): instead of a paid backend server (like Node.js or Python), the logic runs entirely in the user's browser using JavaScript.

The "Database" (Storage): It currently uses your browser's Local Storage to simulate a database. In a production version, this would connect to Google Firebase (Free Tier).

The "Security" (RBAC): It uses Role-Based Access Control. The system behaves differently depending on who logs in:

Admins see everything (Financials, Marketing, CRM).

Tenants only see their rent and maintenance requests.

Owners only see their property performance.

Vendors only see work orders.
