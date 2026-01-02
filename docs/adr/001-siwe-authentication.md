# ADR-001: Sign-In With Ethereum (SIWE) Authentication

## Status

Implemented

## Date

2026-01-02

## Context

NoCall Platform requires a decentralized authentication mechanism that allows users to sign in using their Ethereum wallets without relying on traditional username/password combinations or OAuth providers. This approach aligns with Web3 principles and provides users with full control over their identity.

### Requirements

1. Users must be able to authenticate using their Ethereum wallet
2. Authentication must be secure and resistant to replay attacks
3. The solution must integrate with the existing TanStack Start framework
4. Session management must work seamlessly with the backend

## Decision

We implement Sign-In With Ethereum (SIWE) using the following technology stack:

### Core Libraries

- **Better Auth** (`better-auth`): Authentication framework with built-in SIWE plugin
- **SIWE** (`siwe`): Official SIWE library for message generation and nonce handling
- **Viem**: Ethereum library for signature verification and ENS lookups
- **Wagmi + RainbowKit**: Wallet connection and management
- **Drizzle ORM**: PostgreSQL database ORM with Better Auth adapter
- **Sonner**: Toast notifications for user feedback

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   SIWEButton    │────▶│  Query Functions │────▶│   Better Auth    │
│   Component     │     │   (siwe-queries) │     │   SIWE Plugin   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │                       │                        ▼
        │                       │               ┌─────────────────┐
        │                       │               │  Viem Client    │
        │                       │               │  (Verification) │
        │                       │               └─────────────────┘
        ▼                       │                        │
┌─────────────────┐             │                        ▼
│   RainbowKit    │◀────────────┴──────────────▶│  PostgreSQL     │
│   + Wagmi       │                              │  (Drizzle ORM)  │
│   (Wallet)      │                              └─────────────────┘
└─────────────────┘

         │
         ▼
┌─────────────────┐
│   Utils (utils) │
│  (generateSiwe) │
└─────────────────┘
```

### Authentication Flow

1. **Wallet Connection**: User connects wallet via RainbowKit (Base Sepolia network)
2. **Nonce Request**: Client calls `authClient.siwe.nonce()` with wallet address and chain ID
3. **Message Generation**: Client generates SIWE message using `generateSiweMessage()` with:
   - Domain from `window.location.host`
   - Address from connected wallet
   - Current chain ID (Base Sepolia: 84532)
   - Nonce from server
   - Statement about NoCall Platform terms
4. **Wallet Signing**: User signs the message with their wallet (via wagmi's `signMessageAsync`)
5. **Verification**: Signed message is sent to `authClient.siwe.verify()`
6. **ENS Lookup**: Server resolves ENS name and avatar (if available)
7. **Session Creation**: Better Auth creates a session in PostgreSQL database
8. **User Feedback**: Toast notifications show progress and success/error states

### Database Schema

Using Drizzle ORM with PostgreSQL, extending Better Auth's default schema with custom wallet address tracking.

**Database Configuration:**
- **Provider**: PostgreSQL with SSL enabled
- **Connection**: `DATABASE_URL` environment variable with SSL verification
- **Schema File**: `src/lib/db-schema.ts`

**Core Tables:**

1. **user** - Better Auth default user table
   - Stores user ID, name, email, email verification status, and avatar
   - Includes createdAt and updatedAt timestamps

2. **session** - Better Auth default session table
   - Tracks active sessions with expiration
   - Includes IP address and user agent for security
   - Indexed by user ID for quick lookups

3. **account** - Better Auth default account table
   - Stores OAuth/provider account information
   - Includes access tokens, refresh tokens, and scopes

4. **verification** - Better Auth default verification table
   - Handles email verification and other verification tokens
   - Indexed by identifier for efficient lookups

5. **wallet_address** - Custom table for SIWE
   ```sql
   - id: text (primary key)
   - user_id: text (foreign key to user.id, onDelete cascade)
   - address: text (wallet address)
   - chain_id: integer (blockchain network ID)
   - is_primary: boolean (marks primary wallet, default false)
   - created_at: timestamp (when wallet was linked)
   ```
   - Supports multiple wallets per user
   - Tracks chain ID for multi-chain support
   - Indexed by user ID for efficient queries

**Relations:**
- User has many sessions, accounts, and wallet addresses
- All foreign keys use CASCADE delete for data integrity

### Query Functions

Using direct function calls (not TanStack Query hooks) for the SIWE flow:

**File**: `src/queries/siwe-queries.ts`

1. **fetchNonce(walletAddress: Address)** - Fetches nonce from Better Auth SIWE plugin
   - Calls `authClient.siwe.nonce()` with wallet address and current chain ID
   - Returns nonce string for message signing
   - Throws error if nonce generation fails

2. **verifySiwe(body: VerifyRequest)** - Verifies signature and creates session
   - Takes message, signature, and wallet address
   - Calls `authClient.siwe.verify()` with chain ID from wagmi config
   - Returns token, success status, and user data
   - Throws error if verification fails

**TypeScript Interfaces:**
```typescript
interface NonceResponse {
  nonce: string;
}

interface VerifyRequest {
  message: string;
  signature: string;
  walletAddress: Address;
}

interface VerifyResponse {
  token: string;
  success: boolean;
  user: {
    id: string;
    walletAddress: string;
    chainId: number;
  };
}
```

### SIWE Message Structure

**File**: `src/lib/utils.ts`

```typescript
export const generateSiweMessage = (address: Address, nonce: string) => {
  const statement = `
Sign in with Ethereum to NoCall Platform at nocal.com.\nBy signing this message, you agree to the Terms of Service and Privacy Policy of NoCall Platform. You acknowledge that you have read, understood, and agree to be bound by these terms.This request will not trigger a blockchain transaction and will not cost any gas fees. This signature is only used for authentication purposes on NoCall Platform.
  `.trim()

  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement,
    uri: window.location.origin,
    version: '1',
    chainId: config.getClient().chain.id, // Dynamic chain ID from wagmi
    nonce,
  })
  return message
}
```

**Key Features:**
- Statement includes comprehensive terms and gas fee explanation
- Chain ID is dynamically retrieved from wagmi config
- Message is generated as a `SiweMessage` object
- Converted to string via `message.toMessage()` for signing

### Network Configuration

**File**: `src/lib/wagmi.ts`

```typescript
export const config = getDefaultConfig({
  appName: 'NoCall Protocol',
  projectId: '568d8af63aa033ff1b617ecc8a15f835',
  chains: [baseSepolia],
  ssr: true,
});
```

- **Primary Network**: Base Sepolia (Chain ID: 84532)
- **Project ID**: `568d8af63aa033ff1b617ecc8a15f835`
- **App Name**: "NoCall Protocol"
- **SSR Support**: Enabled for server-side rendering
- **Chain**: Imported from `viem/chains`

## Consequences

### Positive

1. **Self-Sovereign Identity**: Users control their authentication credentials
2. **No Password Management**: Eliminates password-related security risks
3. **ENS Integration**: Automatic ENS name and avatar resolution with fallback to address
4. **Replay Attack Protection**: Nonce-based authentication prevents replay attacks
5. **Framework Integration**: Seamless integration with TanStack Start and React
6. **Type Safety**: Full TypeScript support throughout the stack with proper type guards
7. **Database Flexibility**: Drizzle ORM provides type-safe database operations with relations
8. **Multi-Chain Ready**: Schema supports multiple wallet addresses per user
9. **SSR Compatible**: Wagmi configured for server-side rendering
10. **User Experience**: Comprehensive toast notifications with clear feedback at each step
11. **Error Handling**: Robust error handling with try-catch blocks and graceful fallbacks
12. **Security**: SSL-enabled database connections and comprehensive input validation

### Negative

1. **Wallet Dependency**: Users must have an Ethereum wallet
2. **Learning Curve**: Users unfamiliar with Web3 may need guidance
3. **Network Dependency**: Requires connection to Ethereum node for verification

### Risks

1. **Wallet Security**: User's authentication is only as secure as their wallet
2. **ENS Resolution**: ENS lookups may fail or return stale data
3. **Network Issues**: Ethereum network congestion could affect verification
4. **Base Sepolia Dependency**: Currently limited to Base Sepolia testnet (requires migration for mainnet)

## Implementation Details

### Database Configuration (`src/lib/db.ts`)

```typescript
export const db = getDatabase();

const getDatabase = createServerOnlyFn(() =>
  drizzle({
    connection: {
      connectionString: process.env.DATABASE_URL!,
      ssl: true
    }
  })
);
```

**Features:**
- Uses Drizzle ORM with node-postgres driver
- SSL enabled for secure database connections
- Server-only initialization using `createServerOnlyFn`

### Server-Side Configuration (`src/lib/auth.ts`)

```typescript
const getAuthConfig = createServerOnlyFn(() => betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    siwe({
      domain: "nocal.com",
      emailDomainName: "nocal.com",
      anonymous: false,
      getNonce: async () => {
        const nonce = generateNonce();
        return nonce;
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          const client = config.getClient();
          const isValid = await verifyMessage(client, {
            address: address as Address,
            message,
            signature: signature as Address,
          });
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
      ensLookup: async ({ walletAddress }) => {
        try {
          const client = config.getClient();
          const ensName = await getEnsName(client, {
            address: walletAddress as Address,
          })
          const ensAvatar = await getEnsAvatar(client, {
            name: normalize(ensName as string),
          })
          return {
            name: ensName || walletAddress,
            avatar: ensAvatar || "",
          };
        } catch {
          return {
            name: walletAddress,
            avatar: "",
          };
        }
      },
    }),
  ],
}))
```

**Key Features:**
- Better Auth with SIWE plugin
- PostgreSQL database adapter with Drizzle ORM
- Comprehensive error handling with try-catch blocks
- Type-safe address handling with `Address` type from viem
- Graceful ENS lookup with fallback to wallet address
- Exported as `auth` constant

### Client-Side Setup (`src/lib/auth-client.ts`)

```typescript
export const authClient = createAuthClient({
  plugins: [siweClient()],
});
```

**Features:**
- Simple client configuration with SIWE plugin
- Used by query functions for nonce and verification

### Component Integration (`src/components/derived/siwe-button.tsx`)

The `SiweButton` component is a custom RainbowKit button that handles the complete authentication flow:

**Key Features:**
1. **Wallet Connection State Management**
   - Uses `useConnection()` hook to track wallet connection
   - Shows connection UI when wallet is not connected
   - Displays connected wallet address (formatted: `0x1234...5678`)

2. **Network Validation**
   - Checks if connected network is supported
   - Shows "Wrong network" button if chain is unsupported
   - Displays current chain name with icon

3. **SIWE Authentication Flow**
   - Calls `fetchNonce()` to get server nonce
   - Generates SIWE message using `generateSiweMessage()`
   - Signs message with `signMessageAsync()` from wagmi
   - Calls `verifySiwe()` to verify signature and create session

4. **User Interface**
   - Clean, styled UI with shadcn/ui components
   - Loading states during signing process
   - Wallet icon and visual feedback
   - Account options menu

5. **Error Handling**
   - Comprehensive error handling with try-catch
   - Toast notifications for all states (loading, success, error)
   - User-friendly error messages
   - Descriptive loading messages ("Preparing SIWE message...", "Please sign...", "Verifying...")

6. **Accessibility**
   - Proper ARIA attributes
   - Keyboard navigation support
   - Screen reader friendly
   - High contrast UI elements

**Toast Notifications:**
- Loading: "Preparing SIWE message..." → "Please sign..." → "Verifying..."
- Success: "Successfully signed in with Ethereum!"
- Error: "Authentication failed" with error details

### Utility Functions (`src/lib/utils.ts`)

**generateSiweMessage()**
- Creates SIWE message with comprehensive statement
- Includes terms of service, privacy policy, and gas fee explanation
- Dynamically retrieves chain ID from wagmi config
- Returns `SiweMessage` object for signing

**cn()**
- Utility for merging Tailwind CSS classes
- Combines `clsx` and `tailwind-merge`

## Alternatives Considered

### 1. Traditional OAuth

**Rejected** because:
- Doesn't align with Web3 decentralization principles
- Requires trust in third-party providers
- Users don't control their identity

### 2. Custom JWT Implementation

**Rejected** because:
- Would require building security infrastructure from scratch
- Better Auth provides proven, audited implementation
- More maintenance burden

### 3. Direct SIWE Without Better Auth

**Rejected** because:
- Would require manual session management
- No built-in database adapter integration
- Better Auth provides additional features (session management, middleware)

## References

- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [Better Auth Documentation](https://www.better-auth.com/)
- [SIWE Library](https://github.com/spruceid/siwe)
- [TanStack Query](https://tanstack.com/query)
- [TanStack Start](https://tanstack.com/start)
- [RainbowKit](https://www.rainbowkit.com/)
- [Wagmi](https://wagmi.sh/)
- [Viem](https://viem.sh/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Sonner Toast](https://sonner.emilkowal.ski/)
