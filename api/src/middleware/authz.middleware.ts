import { NextFunction, Request, Response } from "express";
import jwt from "express-jwt";
import axios from "axios";
import jwksRsa from "jwks-rsa";
import { AUTH0_DOMAIN, AUTH0_AUDIENCE } from "../config"
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
      if (resp.data && resp.data.email) {
        let email = resp.data.email;
        sub = resp.data.sub;

        let u = await db.getBySub(resp.data.sub);
        //console.log(email, sub);

        if (u) {
          req.user = { ...req.user, ...u };
          next();
        }
        else {
          await db.create({ email, sub, status: "Inactive" })
          //return res.status(406).send();
          next()
        }
      }
    })
    .catch()
}