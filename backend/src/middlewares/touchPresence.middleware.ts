import { NextFunction, Request, Response } from "express";
import { touchPresence as recordPresence } from "../services/presence.service";

const touchPresence = (req: Request, _res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  if (userId) {
    recordPresence(String(userId)).catch(() => { });
  }

  next();
};

export default touchPresence;
