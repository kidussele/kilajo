# KILAJO — Security & Privacy Architecture

## 1. Multi-Tenant Isolation & Row Level Security (RLS)
- Every user dataset is isolated by Supabase PostgreSQL Row Level Security policies.
- User identity is verified on the server side via cryptographically signed JWT session cookies.
- Queries always restrict execution to `auth.uid() = user_id`.

## 2. Integration Token Security
- Bridge tokens are pseudorandom, high-entropy tokens.
- Tokens grant read-only ingestion access strictly to the assigned account ID.
- Order placement, modification, or cancellation capabilities do not exist in the codebase.

## 3. Data Sanitization & Input Validation
- All inputs are validated on client and server using Zod and TypeScript interfaces.
- Numbers are clamped to safe financial decimals (`NUMERIC(18, 4)` and `NUMERIC(18, 6)`).
- SQL injection is eliminated via parameterized ORM and PostgreSQL drivers.

## 4. Demo Data Boundary
- Sample demonstration accounts are strictly tagged with `demo-` prefixes and isolated from production data storage.
