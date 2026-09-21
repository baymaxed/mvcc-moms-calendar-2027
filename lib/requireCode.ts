// Shared guard used by every write route. Every single write re-validates
// the passcode server-side against the env var - a client "isDGL" flag in
// localStorage is never trusted on its own.
export function isValidCode(code: unknown): code is string {
  return typeof code === "string" && code.length > 0 && code === process.env.DGL_PASSCODE;
}
