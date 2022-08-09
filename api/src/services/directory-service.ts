import axios from "axios";
import { AD_CLIENT_ID, AD_CLIENT_SECRET, AD_TENANT_ID } from "../config";



const AD_SCOPE = "https://graph.microsoft.com/.default";


export class DirectoryService {
    connected = false;
    token = "";
    authHeader = {};

    constructor() {

    }

    async connect(): Promise<any> {
        if (this.connected)
            return;

        let body = `client_id=${AD_CLIENT_ID}&scope=${AD_SCOPE}&client_secret=${AD_CLIENT_SECRET}&grant_type=client_credentials`;

        return axios.post(`https://login.microsoftonline.com/${AD_TENANT_ID}/oauth2/v2.0/token`,
            body, { headers: { "Content-type": 'application/x-www-form-urlencoded' } })
            .then(resp => {
                this.token = resp.data.access_token;
                this.authHeader = { "Authorization": `Bearer ${this.token}`, "ConsistencyLevel": "eventual" };
                this.connected = true;
            })
            .catch(error => { console.error("GRAPH ERROR: ", error); });
    }

    async search(terms: string): Promise<any> {
        if (terms && terms.length > 3) {
            let pieces = terms.replace(".", " ").replace("&", " ").split(" ");
            let queryStmts = new Array<string>();

            for (let piece of pieces) {
                piece = piece.trim();

                if (piece == "")
                    continue;

                queryStmts.push(`(startsWith(givenName,'${piece}') or startsWith(surname,'${piece}') or startsWith(userprincipalname,'${piece}') or startsWith(jobTitle, '${piece}') )`);
            }

            return axios.get<AzureADUserGetResponse>(`https://graph.microsoft.com/v1.0/users?$count=true&$filter=${queryStmts.join(" AND ")} and endsWith(mail, '@yukon.ca')`,
                { headers: this.authHeader })
                .then(resp => {
                    if (resp.data && resp.data.value) {
                        return resp.data.value;
                    }
                    return undefined;
                })
                .catch(error => {
                    console.log("ERROR", error.response.data);
                    return undefined;
                });
        }

        return [];
    }
}


export interface AzureADGroupGetResponse {
    value: AzureADGroup[];
}

export interface AzureADUserGetResponse {
    value: AzureADUser[];
}

export interface AzureADGroup {
    id: string;
    displayName: string;
    members: AzureADUser[];
}

export interface AzureADUser {
    id: string;
    givenName: string;
    surname: string;
    displayName: string;
    mail: string;
    userPrincipalName: string;
    jobTitle: string;
}
