import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db.ts";
import * as schema from "@/lib/db-schema.ts";
import { siwe } from "better-auth/plugins/siwe";
import { generateNonce } from 'siwe';
import { type Address } from 'viem'
import { config } from "@/lib/wagmi";
import { getEnsAvatar, getEnsName, verifyMessage } from "viem/actions";
import { normalize } from 'viem/ens'
import { createServerOnlyFn } from "@tanstack/react-start";

const getAuthConfig = createServerOnlyFn(() => betterAuth({
  database: drizzleAdapter(db, {
    schema,
    provider: "pg",
  }),
  plugins: [
    siwe({
      domain: "nocal.com",
      emailDomainName: "nocal.com",
      anonymous: true,
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
}));

export const auth = getAuthConfig();
