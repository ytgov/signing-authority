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
    jwksUri: `${AUTH0_DOMAIN}.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: AUTH0_AUDIENCE,
  issuer: [AUTH0_DOMAIN],
  algorithms: ["RS256"]
});

export async function isDepartmentAdmin (req: Request, res: Response, next: NextFunction){
  const user = req.user;
  if (!user.roles) {
    console.error(`No user roles found for ${user.email}`);
    res.status(401).send()
    return
  }

  const { department_code } = req.body;
  const { roles, department_admin_for} = req.user;

  if (roles.includes("Department Admin") && department_admin_for !== department_code) {
    console.error(`User: ${user.email} does not have department admin on ${department_code}`);
    res.status(403).send();
    return
  }
  if (!roles.includes("System Admin")){
    res.status(403).send();
  }
  if (!roles.includes("Finance Admin")) {
    res.status(403).send();
  }
  next();
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

  await axios.get(`${AUTH0_DOMAIN}userinfo`,
    { headers: { 'authorization': token } })
    .then(async resp => {
      if (resp.data && resp.data.sub) {
        let email = resp.data.email;
        let first_name = resp.data.given_name;
        let last_name = resp.data.family_name;
        sub = resp.data.sub;

        let u = await db.getBySub(sub);

        if (u) {
          req.user = { ...req.user, ...u };
        }
        else {
          if (!email)
            email = `${first_name}.${last_name}@yukon-no-email.ca`;

          u = await db.create({ email, sub, status: "Inactive", first_name, last_name });
          console.log("CREATING USER FOR " + email);
          req.user = { ...req.user, ...u };
        }
      }
      else {
        console.log("Payload from Auth0 is strange or failed for", req.user);
      }

      next();
    })
    .catch(err => {
      console.log("ERROR pulling userinfo", err);
    });
}