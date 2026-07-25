import { useEffect } from "react";
import { useAuth } from "./AuthContext";

/**
 * PortalGuard — enforces that a given Vite instance (identified by its
 * fixed `portal` config, see roleConfig.js PORTALS) only ever shows
 * authenticated content for ITS OWN required role.
 *
 * If a token/user for a different role ends up in this origin's
 * localStorage (e.g. a stray token, or the wrong portal.env was used),
 * this clears auth via the existing AuthContext.logout() — which already
 * disconnects the socket and removes the stored token/user — and lets
 * normal (isAuthenticated === false) routing take over on the next render.
 *
 * This does not create a redirect loop: logout() flips isAuthenticated to
 * false, which removes the mismatch condition below, so the effect does
 * not re-fire. No new localStorage/socket cleanup logic is introduced —
 * this is purely a role check that reuses the existing logout flow.
 */
export default function PortalGuard({ portal, children }) {
  const { isAuthenticated, role, logout } = useAuth();

  const isWrongRole =
    isAuthenticated && !!role && role !== portal.requiredRole;

  useEffect(() => {
    if (isWrongRole) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWrongRole]);

  // While the mismatch is still present (i.e. during the single render
  // before the effect above runs logout()), render nothing rather than
  // momentarily flashing protected content for the wrong role.
  if (isWrongRole) {
    return null;
  }

  return children;
}
