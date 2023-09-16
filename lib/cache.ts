import fs from "fs";
import path from "path";
import database from "./database";
import { consoleCheck, consoleLog } from "./logger";
import { kudosuUsers } from "@models/KudosuUser";

export async function getUserWithCache(osuId: number) {
    // directory and files check
    if (!fs.existsSync("./cache")) {
        fs.mkdirSync("./cache");
        consoleCheck("Cache", "Cache directory created");
    }

    if (!fs.existsSync(path.resolve("./cache/rankings.json"))) {
        fs.writeFileSync(
            path.resolve("./cache/rankings.json"),
            JSON.stringify(
                {
                    users: [],
                },
                null,
                3
            )
        );
        consoleCheck("Cache", "Cache files created");
    }

    let rankings = JSON.parse(fs.readFileSync(path.resolve("./cache/rankings.json"), "utf-8"));

    let user = rankings.users.find((user: any) => user.osuId === osuId);

    // Check if the user exists in the cache, or if the cache is older than 30 minutes
    if (!user || (user && Date.now() - new Date(user.updatedAt).getTime() > 1000 * 60 * 30)) {
        consoleLog("Cache", `User ${osuId} not found/not updated in cache, checking database...`);

        database();

        const dbUser = await kudosuUsers.findOne({ osuId });

        if (dbUser) {
            if (user) {
                consoleLog("Cache", `User ${osuId} found in database, updating cache...`);

                rankings.users = rankings.users.map((user: any) => {
                    if (user.osuId === osuId) {
                        user = dbUser;
                        user.updatedAt = Date.now();
                    }
                    return user;
                });

                fs.writeFileSync(
                    path.resolve("./cache/rankings.json"),
                    JSON.stringify(rankings, null, 3)
                );

                consoleCheck("Cache", `User ${osuId} updated in cache`);

                return rankings.users.find((user: any) => user.osuId === osuId);
            } else {
                consoleLog("Cache", `User ${osuId} not found in cache, adding...`);

                rankings.users.push(dbUser);

                fs.writeFileSync(
                    path.resolve("./cache/rankings.json"),
                    JSON.stringify(rankings, null, 3)
                );

                consoleCheck("Cache", `User ${osuId} added to cache`);

                return rankings.users[rankings.users.length - 1];
            }
        } else {
            consoleLog("Cache", `User ${osuId} not found in database, removing from cache...`);

            rankings.users = rankings.users.filter((user: any) => user.osuId !== osuId);

            fs.writeFileSync(
                path.resolve("./cache/rankings.json"),
                JSON.stringify(rankings, null, 3)
            );

            return;
        }
    } else {
        consoleCheck("Cache", `User ${osuId} found in cache`);
        return user;
    }
}
