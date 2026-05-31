// Only apply the Vercel preset when building in a Vercel environment.
// This prevents conflicts in the Lovable builder and preview environments.
export default {
  preset: process.env.VERCEL === "1" ? "vercel" : undefined,
};
