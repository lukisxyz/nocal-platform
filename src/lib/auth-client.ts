import { createAuthClient } from "better-auth/client";
import { siweClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [siweClient()],
});
