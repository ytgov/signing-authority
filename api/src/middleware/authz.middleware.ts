import { NextFunction, Request, Response } from "express";
import jwt from "express-jwt";
import axios from "axios";
import jwksRsa from "jwks-rsa";
import { AUTH0_DOMAIN, AUTH0_AUDIENCE } from "../config";
import { UserService } from "../services";

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${AUTH0_DOMAIN}.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: AUTH0_AUDIENCE,
  issuer: [AUTH0_DOMAIN],
  algorithms: ["RS256"],
});

export async function isFormAAdmin(req: Request, res: Response, next: NextFunction) {
  const { department_code } = req.body;
  const { roles, department_admin_for } = req.user;

  // these folks can do it all!
  if (roles.includes("System Admin")) return next();
  if (roles.includes("Form A Administrator") && department_admin_for.includes(department_code)) return next();

  return res.status(403).send(`You do not have Form A Administrator on ${department_code}`);
}

export async function isFormBAdmin(req: Request, res: Response, next: NextFunction) {
  const { department_code } = req.body;
  const { roles, department_admin_for } = req.user;

  // these folks can do it all!
  if (roles.includes("System Admin")) return next();
  if (roles.includes("Form B Administrator") && department_admin_for.includes(department_code)) return next();

  return res.status(403).send(`You do not have Form B Administrator on ${department_code}`);
}

export async function isFormBOrActingAdmin(req: Request, res: Response, next: NextFunction) {
  const { department_code } = req.body;
  const { roles, department_admin_for } = req.user;

  // these folks can do it all!
  if (roles.includes("System Admin")) return next();
  if (roles.includes("Form B Administrator") && department_admin_for.includes(department_code)) return next();
  if (roles.includes("Acting Appointment Administrator") && department_admin_for.includes(department_code)) return next();

  return res.status(403).send(`You do not have Form B Administrator on ${department_code}`);
}

export async function isActingAdmin(req: Request, res: Response, next: NextFunction) {
  const { department_code } = req.body;
  const { roles, department_admin_for } = req.user;

  // these folks can do it all!
  if (roles.includes("System Admin")) return next();
  if (roles.includes("Acting Appointment Administrator") && department_admin_for.includes(department_code))
    return next();

  return res.status(403).send(`You do not have Acting Appointment Administrator on ${department_code}`);
}

export async function loadUser(req: Request, res: Response, next: NextFunction) {
  const db = req.store.Users as UserService;

  let sub = req.user.sub;
  const token = req.headers.authorization || "";
  let u = await db.getBySub(sub);

  if (u) {
    req.user = { ...req.user, ...u };
    return next();
  }

  await axios
    .get(`${AUTH0_DOMAIN}userinfo`, { headers: { authorization: token } })
    .then(async (resp) => {
      if (resp.data && resp.data.sub) {
        let email = resp.data.email;
        let first_name = resp.data.given_name;
        let last_name = resp.data.family_name;
        sub = resp.data.sub;

        let u = await db.getBySub(sub);

        if (u) {
          req.user = { ...req.user, ...u };
        } else {
          if (!email) email = `${first_name}.${last_name}@yukon-no-email.ca`;

          u = await db.create({ email, sub, status: "Inactive", first_name, last_name, roles: ["Employee"] });
          console.log("CREATING USER FOR " + email);
          req.user = { ...req.user, ...u };
        }
      } else {
        console.log("Payload from Auth0 is strange or failed for", req.user);
      }

      next();
    })
    .catch((err) => {
      console.log("ERROR pulling userinfo", err);
    });
}
