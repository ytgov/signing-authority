import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { ReturnValidationErrors } from "../middleware";
import { UserService } from "../services";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";

export const userRouter = express.Router();

const db = new UserService();

userRouter.get("/me", EnsureAuthenticated,
    async (req: Request, res: Response) => {
        let person = req.user;
        let me = await db.getByEmail(person.email);
        return res.json({ data: await db.makeDTO(Object.assign(req.user, me)) });
    });

userRouter.get("/", EnsureAuthenticated,
    async (req: Request, res: Response) => {
        let list = await db.getAll();

        for (let user of list) {
            user = await db.makeDTO(user)
        }

        return res.json({ data: list });
    });

userRouter.put("/:email", EnsureAuthenticated,
    [param("email").notEmpty().isString()], ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { email } = req.params;
        let { roles, status } = req.body;

        let user = {
            roles: _.join(roles, ","),
            status,
        };

        await db.update(email, user);

        return res.json({ messages: [{ variant: "success", text: "User saved" }] });
    });

userRouter.delete("/:id", EnsureAuthenticated,
    [param("id").notEmpty()], ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { id } = req.params;

        //await db.disable(id);

        let list = await db.getAll();

        return res.json({ data: list, messages: [{ variant: "success", text: "Location removed" }] });
    });

// this will be removed when the application is deployed
userRouter.get("/make-admin/:email/:key",
    async (req: Request, res: Response) => {
        let user = await db.getByEmail(req.params.email);

        let { email, key } = req.params;

        if (key != process.env.SECRET) {
            return res.status(403).send("Your key is invalid");
        }

        if (user) {
            console.log(`KEY MATCHES, making ${email} an admin`);
            user.roles = ["Admin"];
            await db.update(email, user);
        }

        res.send("Done");
    });
