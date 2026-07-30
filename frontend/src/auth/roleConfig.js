/**
 * Centralized role / portal configuration.
 *
 * There are TWO distinct, easy-to-confuse concepts in this app — keep them separate:
 *
 * 1. ROLE — comes back from the backend after a successful login, stored on the
 *    JWT and on `user.role` (via AuthContext). This is what actually governs
 *    access control. Exact values used throughout the backend and frontend:
 *      "admin"   - Administrator
 *      "secure"  - Internal / LDAP employee
 *      "outside" - External user
 *
 * 2. LOGIN TYPE — sent by the frontend to POST /api/signin as `loginType`, to
 *    tell the backend which credential check to run (loginAdmin / loginInternal /
 *    loginExternal in userController.js). Exact values the backend expects:
 *      "admin"
 *      "internal"
 *      "external"
 *
 * Note "admin" happens to be spelled the same in both sets — that's a
 * coincidence in the existing backend, not a rule. "internal"/"secure" and
 * "external"/"outside" are NOT interchangeable. Never use a loginType value
 * where a role is expected, or vice versa.
 */

// authenticated role -> that role's dashboard path
export const ROLE_DASHBOARDS = {
  admin: "/admin/dashboard",
  secure: "/internal/dashboard",
  outside: "/external/dashboard",
};

// portal key (as used in the URL, e.g. /admin/login) -> loginType value
// expected by POST /api/signin's `loginType` field
export const PORTAL_LOGIN_TYPES = {
  admin: "admin",
  internal: "internal",
  external: "external",
};

// portal key -> that portal's dedicated login path
export const PORTAL_LOGIN_PATHS = {
  admin: "/admin/login",
  internal: "/internal/login",
  external: "/external/login",
};

// Resolve the dashboard path for an authenticated role, falling back to the
// unified login page if the role is missing/unrecognized.
export function dashboardForRole(role) {
  return ROLE_DASHBOARDS[role] || "/login";
}

/**
 * PORTALS — centralized per-VITE_PORTAL configuration used by the
 * three-port architecture (App.jsx, the *Routes.jsx files, PortalGuard).
 *
 * Built entirely from the maps above so nothing is duplicated: each entry's
 * requiredRole/loginType/loginPath/dashboardPath is just that portal's slice
 * of ROLE_DASHBOARDS / PORTAL_LOGIN_TYPES / PORTAL_LOGIN_PATHS, keyed by
 * portal instead of by role.
 */
const PORTAL_REQUIRED_ROLES = {
  admin: "admin",
  internal: "secure",
  external: "outside",
};

export const PORTALS = Object.freeze(
  Object.fromEntries(
    Object.keys(PORTAL_REQUIRED_ROLES).map((portalKey) => [
      portalKey,
      Object.freeze({
        key: portalKey,
        requiredRole: PORTAL_REQUIRED_ROLES[portalKey],
        loginType: PORTAL_LOGIN_TYPES[portalKey],
        loginPath: PORTAL_LOGIN_PATHS[portalKey],
        dashboardPath: ROLE_DASHBOARDS[PORTAL_REQUIRED_ROLES[portalKey]],
      }),
    ]),
  ),
);

/**
 * Display-only branding per portal, used by the login page for the
 * portal-specific label/icon/accent. Purely cosmetic — not read by any
 * auth/authorization logic, so it can't affect loginType or role checks.
 */
export const PORTAL_LOGIN_DISPLAY = Object.freeze({
  admin: {
    label: "Admin Portal",
    icon: "ti-key",
    accentClass: "portal-accent-admin",
  },
  internal: {
    label: "Internal Portal",
    icon: "ti-shield-lock",
    accentClass: "portal-accent-internal",
  },
  external: {
    label: "External Portal",
    icon: "ti-user",
    accentClass: "portal-accent-external",
  },
});
