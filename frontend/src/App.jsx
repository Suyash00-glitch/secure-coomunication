import { Suspense, lazy } from "react";
import { PORTALS } from "./auth/roleConfig";
import PortalGuard from "./auth/PortalGuard";

const PORTAL_KEY = import.meta.env.VITE_PORTAL;
const portal = PORTALS[PORTAL_KEY];

// Dynamic, per-portal imports keyed off literal string branches (not a
// variable/template path) so each build (`vite build --mode admin` /
// `--mode internal` / `--mode external`) only pulls its own portal's route
// tree — and therefore only that portal's page components — into that
// build's output. The other two portals' code is not part of this bundle.
let loadPortalRoutes = null;
if (PORTAL_KEY === "admin") {
  loadPortalRoutes = () => import("./routes/AdminRoutes");
} else if (PORTAL_KEY === "internal") {
  loadPortalRoutes = () => import("./routes/InternalRoutes");
} else if (PORTAL_KEY === "external") {
  loadPortalRoutes = () => import("./routes/ExternalRoutes");
}

const PortalRoutes = loadPortalRoutes ? lazy(loadPortalRoutes) : null;

/**
 * Visible, non-silent configuration error shown when VITE_PORTAL is
 * missing or not one of "admin" | "internal" | "external". Intentionally
 * does NOT fall back to any portal and does NOT expose any secrets/config
 * beyond the fact that VITE_PORTAL itself is unset/invalid.
 */
function PortalMisconfigured() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, sans-serif",
        background: "#0f172a",
        color: "#f8fafc",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>
          Portal configuration error
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.5 }}>
          VITE_PORTAL is missing or invalid. This Vite instance must be
          started with VITE_PORTAL set to one of: <code>admin</code>,{" "}
          <code>internal</code>, or <code>external</code> (e.g. via{" "}
          <code>npm run dev:admin</code>, <code>npm run dev:internal</code>,
          or <code>npm run dev:external</code>).
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!portal || !PortalRoutes) {
    return <PortalMisconfigured />;
  }

  return (
    <PortalGuard portal={portal}>
      <Suspense fallback={null}>
        <PortalRoutes portal={portal} />
      </Suspense>
    </PortalGuard>
  );
}
