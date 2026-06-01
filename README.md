# kudosu-api

this api is mainly used to get a user's kudosu ranking, among other basic data. it works by using [osu!api v2](https://osu.ppy.sh/docs/index.html) to get the top 1k users of the kudosu ranking leaderboard, and saving them to a database every hour.

## usage

endpoints are present at https://kudosu-api.vercel.app, and are as follows:

- `/api/user/{osuId}` - get a user by their osu! id
- `/api/rank/{rank}` - get a user by their kudosu rank
- `/api/ranking/{page}` - get a page of users from the kudosu ranking leaderboard, each page contains 50 users

routes return a single, or an array of `KudosuUser` object(s). the `KudosuUser` object is defined as follows:

```typescript
interface IKudosuUser {
    _id: string;
    avatar_url: string;
    osuId: number;
    username: string;
    rank: number;
    kudosu: number;
    updatedAt: Date;
}
```

## running locally

>[!WARNING]
>the actual part that syncs data from the osu! api and updates the db is not present here, it's running on my [discord bot](https://github.com/AxerBot/axer-bot/blob/main/modules/automation/jobs/updateKudosuRankings.ts). the only thing this app does is fetch from the db (with some caching involved) and provide endpoints.

- clone the repo
- run `npm install`
- create a `.env.local` file in the root directory from `.env.local.example`
- run `npm run dev`, the api should be running on `localhost:3000`

>[!NOTE]
>this api was specifically created for my [kudosu rank userscript](https://github.com/Hiviexd/kudosu-rank), tho i'll try to keep this api running until there is proper support for kudosu rank in the official api. but don't be surprised if this might just go offline at one point.

## todo

- [ ] add caching for `/api/rank`
- [ ] possibly build a proper frontend that has an actual leaderboard
