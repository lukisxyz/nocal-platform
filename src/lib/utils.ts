import { type ClassValue, clsx } from "clsx";
import { createSiweMessage } from 'viem/siwe'
import { twMerge } from "tailwind-merge";
import { Address } from "viem";
import { config } from "@/lib/wagmi";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateSiweMessage = (address: Address, nonce:
  string) => {
  const statement = `
Sign in with Ethereum to NoCall Platform at nocal.com. By signing this message, you agree to the Terms of Service and Privacy Policy of NoCall Platform. You acknowledge that you have read, understood, and agree to be bound by these terms.This request will not trigger a blockchain transaction and will not cost any gas fees. This signature is only used for authentication purposes on NoCall Platform.
  `.trim()

  const message = createSiweMessage({
    domain: window.location.host,
    address,
    statement,
    uri: window.location.origin,
    version: '1',
    chainId: config.getClient().chain.id,
    nonce,
  })
  return message
}
