import { useConnection, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { generateSiweMessage } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, LogOut, Wallet, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/wagmi";
import { useNavigate } from "@tanstack/react-router";

export function SiweButton() {
  const { address } = useConnection();
  const navigate = useNavigate();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  const isAuthenticating = isSigning;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSignIn = async () => {
    if (!address) {
      toast.error("No wallet connected", {
        description: "Please connect your wallet first",
      });
      return;
    }

    const toastId = toast.loading("Preparing Sign In With Ethereum message...");

    try {
      const { data } = await authClient.siwe.nonce({
        walletAddress: address,
        chainId: config.getClient().chain.id
      })
      if (!data?.nonce) {
        throw new Error("Failed to generate nonce");
      }

      toast.loading("Please sign the message in your wallet...", {
        id: toastId,
        description: "This won't cost any gas",
      });

      const message = generateSiweMessage(address, data.nonce);

      const signature = await signMessageAsync({ message });

      toast.loading("Verifying signature...", {
        id: toastId,
        description: "Checking authentication",
      });

      const verifyData = await authClient.siwe.verify({
        message,
        signature,
        walletAddress: address,
        chainId: config.getClient().chain.id
      });

      if (!verifyData) {
        throw new Error("Authentication failed");
      }

      toast.success("Successfully signed in with Ethereum!", {
        id: toastId,
        description: `Welcome!`,
      });

      navigate({ from: "/login", to: "/dashboard" })
    } catch (error: any) {
      toast.error("Authentication failed", {
        id: toastId,
        description: error?.message || "Please try again",
      });
    }
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={openConnectModal}
                      className="w-full inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 border border-transparent focus:ring-4 focus:ring-blue-300 shadow-sm font-medium rounded-lg text-base px-5 py-3 focus:outline-none"
                    >
                      <Wallet className="w-4 h-4 me-1.5" />
                      Connect Wallet
                    </button>
                    <p className="text-sm text-gray-500">
                      Connect your wallet to sign in with Ethereum
                    </p>
                  </div>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="w-full inline-flex items-center justify-center text-white bg-red-600 hover:bg-red-700 border border-transparent focus:ring-4 focus:ring-red-300 shadow-sm font-medium rounded-lg text-base px-5 py-3 focus:outline-none"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Wallet Connected</h3>
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={openChainModal}
                        className="inline-flex items-center text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 font-medium rounded-lg text-sm px-2 py-1 focus:outline-none"
                      >
                        {chain.hasIcon && (
                          <div
                            className="w-4 h-4 rounded-full overflow-hidden mr-1"
                            style={{ background: chain.iconBackground }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Address:{" "}
                      <span className="font-mono text-gray-800">
                        {formatAddress(account.address)}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={isAuthenticating || isSigning}
                        className="flex-1 inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 border border-transparent focus:ring-4 focus:ring-blue-300 shadow-sm font-medium rounded-lg text-base px-5 py-3 focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isAuthenticating || isSigning ? (
                          <>
                            <Loader2 className="w-4 h-4 me-1.5 animate-spin" />
                            Signing...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4 ms-1.5" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={openAccountModal}
                        title="Account options"
                        className="inline-flex items-center justify-center text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 font-medium rounded-lg text-base px-3 py-3 focus:outline-none focus:ring-4 focus:ring-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Want to use a different wallet? Click the icon to disconnect
                  </p>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
