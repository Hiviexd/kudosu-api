import fs from "fs";
import path from "path";
import database from "./database";
import { consoleCheck, consoleLog } from "./logger";
import { kudosuUsers } from "@models/KudosuUser";

const USER_TTL_MS = 1000 * 60 * 30;
const NOT_FOUND_TTL_MS = 1000 * 60 * 15;

export const HTTP_CACHE_USER = "public, s-maxage=1800, stale-while-revalidate=3600";
export const HTTP_CACHE_NOT_FOUND = "public, s-maxage=900, stale-while-revalidate=1800";

type CachedUser = {
    osuId: number;
    updatedAt: number | string | Date;
    [key: string]: unknown;
};

type RankingsCache = {
    users: CachedUser[];
    notFound: { osuId: number; cachedAt: number }[];
};

function getCacheDir() {
    return process.env.NODE_ENV === "production" ? "/tmp/cache" : "./cache";
}

function getRankingsPath() {
    return path.resolve(`${getCacheDir()}/rankings.json`);
}

function ensureCacheFile(): RankingsCache {
    const cacheDir = getCacheDir();

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
        consoleCheck("Cache", "Cache directory created");
    }

    const rankingsPath = getRankingsPath();

    if (!fs.existsSync(rankingsPath)) {
        const empty: RankingsCache = { users: [], notFound: [] };
        fs.writeFileSync(rankingsPath, JSON.stringify(empty, null, 3));
        consoleCheck("Cache", "Cache files created");
        return empty;
    }

    const rankings = JSON.parse(fs.readFileSync(rankingsPath, "utf-8")) as RankingsCache;
    if (!rankings.notFound) {
        rankings.notFound = [];
    }
    return rankings;
}

function writeRankings(rankings: RankingsCache) {
    fs.writeFileSync(getRankingsPath(), JSON.stringify(rankings, null, 3));
}

function isStale(updatedAt: number | string | Date, ttlMs: number) {
    return Date.now() - new Date(updatedAt).getTime() > ttlMs;
}

function toCachedUser(dbUser: { toObject?: () => CachedUser } & CachedUser): CachedUser {
    const plain = typeof dbUser.toObject === "function" ? dbUser.toObject() : dbUser;
    return { ...plain, updatedAt: Date.now() };
}

function rememberNotFound(rankings: RankingsCache, osuId: number) {
    rankings.notFound = rankings.notFound.filter((entry) => entry.osuId !== osuId);
    rankings.notFound.push({ osuId, cachedAt: Date.now() });
    rankings.users = rankings.users.filter((user) => user.osuId !== osuId);
    writeRankings(rankings);
}

function forgetNotFound(rankings: RankingsCache, osuId: number) {
    const before = rankings.notFound.length;
    rankings.notFound = rankings.notFound.filter((entry) => entry.osuId !== osuId);
    if (before !== rankings.notFound.length) {
        writeRankings(rankings);
    }
}

export async function getUserWithCache(osuId: number) {
    if (!Number.isFinite(osuId) || osuId <= 0) {
        return;
    }

    let rankings = ensureCacheFile();

    const negative = rankings.notFound.find((entry) => entry.osuId === osuId);
    if (negative && !isStale(negative.cachedAt, NOT_FOUND_TTL_MS)) {
        consoleCheck("Cache", `User ${osuId} known missing (negative cache)`);
        return;
    }

    let user = rankings.users.find((entry) => entry.osuId === osuId);

    if (!user || isStale(user.updatedAt, USER_TTL_MS)) {
        consoleLog("Cache", `User ${osuId} not found/not updated in cache, checking database...`);

        await database();

        const dbUser = await kudosuUsers.findOne({ osuId });

        if (dbUser) {
            forgetNotFound(rankings, osuId);
            rankings = ensureCacheFile();

            const cached = toCachedUser(dbUser);

            if (user) {
                consoleLog("Cache", `User ${osuId} found in database, updating cache...`);
                rankings.users = rankings.users.map((entry) =>
                    entry.osuId === osuId ? cached : entry
                );
            } else {
                consoleLog("Cache", `User ${osuId} not found in cache, adding...`);
                rankings.users.push(cached);
            }

            writeRankings(rankings);
            consoleCheck("Cache", `User ${osuId} updated in cache`);
            return cached;
        }

        consoleLog("Cache", `User ${osuId} not found in database, negative caching...`);
        rememberNotFound(rankings, osuId);
        return;
    }

    consoleCheck("Cache", `User ${osuId} found in cache`);
    return user;
}
