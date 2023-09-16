import { NextApiRequest, NextApiResponse } from "next";
import database from "@lib/database";
import { consoleCheck, consoleError } from "@lib/logger";
import { kudosuUsers } from "@models/KudosuUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await database();
    const { page } = req.query;

    const users = await kudosuUsers
        .find({})
        .sort({ kudosu: -1 })
        .skip((Number(page) - 1) * 50)
        .limit(50);

    if (!users) {
        consoleError("API", `Rankings page ${page} not found`);
        return res.status(404).json({ error: `Rankings page ${page} not found` });
    }

    consoleCheck("API", `Rankings page ${page} found`);
    return res.status(200).json(users);
}
