import { NextApiRequest, NextApiResponse } from "next";
import { consoleCheck, consoleError } from "@lib/logger";
import { getUserWithCache, HTTP_CACHE_NOT_FOUND, HTTP_CACHE_USER } from "@lib/cache";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const user = await getUserWithCache(Number(id));

    if (!user) {
        consoleError("API", `User ${id} not found`);
        res.setHeader("Cache-Control", HTTP_CACHE_NOT_FOUND);
        return res.status(404).json({ error: "User not found" });
    }

    consoleCheck("API", `User ${id} found`);
    res.setHeader("Cache-Control", HTTP_CACHE_USER);
    return res.status(200).json(user);
}
