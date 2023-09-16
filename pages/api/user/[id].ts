import { NextApiRequest, NextApiResponse } from "next";
import { consoleCheck, consoleError } from "@lib/logger";
import { getUserWithCache } from "@lib/cache";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const user = await getUserWithCache(Number(id));

    if (!user) {
        consoleError("API", `User ${id} not found`);
        return res.status(404).json({ error: "User not found" });
    }

    consoleCheck("API", `User ${id} found`);
    return res.status(200).json(user);
}
