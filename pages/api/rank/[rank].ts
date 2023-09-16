import { NextApiRequest, NextApiResponse } from "next";
import database from "@lib/database";
import { consoleCheck, consoleError } from "@lib/logger";
import { kudosuUsers } from "@models/KudosuUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await database();
    const { rank } = req.query;

    const user = await kudosuUsers.findOne({ rank: Number(rank) });

    if (!user) {
        consoleError("API", `User with rank ${rank} not found`);
        return res.status(404).json({ error: `User with rank ${rank} not found` });
    }

    consoleCheck("API", `User with rank ${rank} found`);
    return res.status(200).json(user);
}
