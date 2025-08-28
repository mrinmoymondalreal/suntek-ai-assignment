import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({ message });
};
