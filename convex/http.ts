import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Register Better Auth routes
// This handles /api/auth/* endpoints automatically
authComponent.registerRoutes(http, createAuth);

export default http;
