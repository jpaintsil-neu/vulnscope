import { createHash, randomBytes } from "node:crypto";

// Secure cookies on the public deployment.
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_NAME = IS_PRODUCTION
  ? "__Host-vulnscope-workspace"
  : "vulnscope_workspace";
const COOKIE_AGE = 365 * 24 * 60 * 60 * 1000;

/**
 * Returns the guest workspace's server-side owner ID.
 */
export function getLocalWorkspaceOwner(req, res, { create = false } = {}) {
  // Read this application's cookie.
  const cookie = (req.headers.cookie ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  let token = cookie?.slice(COOKIE_NAME.length + 1);

  // Create a workspace only when requested.
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create) {
      return null;
    }

    token = randomBytes(32).toString("hex");
  }

  // Remember the guest workspace.
  if (create) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: IS_PRODUCTION,
      path: "/",
      maxAge: COOKIE_AGE,
    });
  }

  // Keep the browser token out of MongoDB.
  return createHash("sha256").update(token).digest("hex");
}
