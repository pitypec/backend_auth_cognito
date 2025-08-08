import app from "./setup/express";
import { NODE_ENV } from "./config/env";

// NODE_ENV !== "test"; // avoiding main database connection in test cases

export default app;
