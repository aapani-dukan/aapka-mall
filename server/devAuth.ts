import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Development authentication bypass
export function setupDevAuth(app: Express) {
  // In development, create a mock user session
  app.use((req: any, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      // Mock user for development
      req.user = {
        claims: {
          sub: 'dev-user-123',
          email: 'developer@example.com',
          first_name: 'Dev',
          last_name: 'User',
        }
      };
      req.isAuthenticated = () => true;
    }
    next();
  });

  // Development auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const userId = 'dev-user-123';
        let user = await storage.getUser(userId);
        
        // Create dev user if doesn't exist
        if (!user) {
          user = await storage.upsertUser({
            id: userId,
            email: 'developer@example.com',
            firstName: 'Dev',
            lastName: 'User',
          });
        }
        
        res.json(user);
      } catch (error) {
        console.error("Error with dev user:", error);
        res.status(500).json({ message: "Failed to create dev user" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  app.get('/api/login', (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      res.redirect('/');
    } else {
      res.status(404).json({ message: "Not found" });
    }
  });

  app.get('/api/logout', (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      res.redirect('/');
    } else {
      res.status(404).json({ message: "Not found" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
