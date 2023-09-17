export const BACKEND_URL =
  process.env.REACT_APP_NODE_ENV === "production"
    ? "https://bookedit.fly.dev"
    : "http://localhost:3000";
