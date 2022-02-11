import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Storage } from "../data";

const store = new Storage();

export async function ReturnValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
}

export function RequiresAuthentication(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/api/auth/login');
}

export async function RequiresData(req: Request, res: Response, next: NextFunction) {
    //   let store = new Storage();

    store.ensureConnected()
        .then(worked => {
            req.store = store;
            next();
        })
        .catch(error => {
            res.status(500).send("Cant connect to database");
        })
}
