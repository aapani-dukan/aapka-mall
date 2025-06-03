import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// ✅ Health check route for Render
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).send("✅ Health check passed!");
});

// Also a custom root check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("✅ Shopnish server is live!");
});

(async () => {
  try {
    console.log("🟡 Step 1: Registering routes...");
    await registerRoutes(app);
    console.log("🟢 Step 1 done.");
  } catch (err) {
    console.error("❌ registerRoutes failed:", err);
  }

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("❌ Error handled in middleware:", err);
  });

  try {
    console.log("🟡 Step 2: Serving frontend...");
    if (app.get("env") === "development") {
      await setupVite(app, app);
    } else {
      serveStatic(app);
    }
    console.log("🟢 Step 2 done.");
  } catch (err) {
    console.error("❌ setupVite or serveStatic failed:", err);
  }

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Shopnish server is live on port ${port}`);
    log(`✅ Shopnish server is live on port ${port}`);
  });
})();
