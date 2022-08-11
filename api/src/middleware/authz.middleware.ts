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

export async function loadUser(req: Request, res: Response, next: NextFunction) {
  const db = req.store.Users as UserService;

  console.log("LOADUSER", req.user, req.user.sub)

  let sub = req.user.sub;
  const token = req.headers.authorization || "";
  let u = await db.getBySub(sub);

  console.log("AFTER GETBYSUB", u)

  if (u) {
    req.user = { ...req.user, ...u };
    console.log("RETURNING USER")
    return next();
  }

  
  console.log("DOING CALL TO USERINFO")

  await axios.get(`${AUTH0_DOMAIN}userinfo`,
    { headers: { 'authorization': token } })
    .then(async resp => {
        console.log("USER INFO RESP", resp, resp.data)

      if (resp.data && resp.data.email) {



        console.log("LOOKUP Auth0", resp.data);
        let email = resp.data.email;
        let first_name = resp.data.given_name;
        let last_name = resp.data.family_name;

        sub = resp.data.sub;

        let u = await db.getBySub(resp.data.sub);

        if (u) {
          req.user = { ...req.user, ...u };
          next();
        }
        else {
          await db.create({ email, sub, status: "Inactive", first_name, last_name });
          //return res.status(406).send();
          next();
        }
      }
    })
    .catch(err => {
      console.log("ERROR pulling userinfo", err);
    });
}