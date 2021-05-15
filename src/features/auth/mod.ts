import { authMiddleware } from "./auth.ts";
import { protect } from "./protect.ts";
import "./loginRoutes.ts";
import "./registerRoutes.ts";

export { authMiddleware, protect };
