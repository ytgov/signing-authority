import express, { Request, Response } from "express";
import { reverse, sortBy } from "lodash";
import { Authority, setAuthorityStatus } from "../data/models";
import { RequiresData } from "../middleware";
import { GenericService } from "../services";

export const integrationRouter = express.Router();
integrationRouter.use(RequiresData);

integrationRouter.get("/authorities-for-user/:email", async (req: Request, res: Response) => {
  const { email } = req.params;
  console.log("Authorities requested for", email);

  let db = req.store.Authorities as GenericService<Authority>;
  let regex = RegExp(email, "i");
  let auths = await db.getAll({ "employee.email": { $regex: regex } });

  for (let auth of auths) {
    setAuthorityStatus(auth);
    delete auth.audit_lines;
    delete auth.form_a;
  }

  auths = auths.filter((a) => a.status == "Active");

  let results = new Array<any>();

  for (let auth of auths) {
    let modified_date = new Date();
    if (auth.activation) {
      let activations = auth.activation.map((a) => a.approve_user_date || new Date());
      activations = reverse(sortBy(activations));
      modified_date = activations[0];
    }

    let authority_lines = auth.authority_lines.filter((a) => !a.operational_restriction);
    results.push({ email: auth.employee.email, authority_lines, modified_date });
  }

  console.log("** Sending", results.length);

  res.json({ data: results });
});
