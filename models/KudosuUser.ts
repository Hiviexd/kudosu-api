import mongoose from "mongoose";

export interface IKudosuUser extends mongoose.Document {
    avatar_url: string;
    osuId: number;
    username: string;
    rank: number;
    kudosu: number;
    updatedAt: Date;
}

const KudosuUserSchema = new mongoose.Schema({
    _id: String,
    avatar_url: String,
    osuId: {
        type: Number,
        required: [true, "Please provide an osu! user id"],
        unique: true,
    },
    username: String,
    rank: Number,
    kudosu: Number,
    updatedAt: Date,
});

export const kudosuUsers =
    mongoose.models.kudosuUsers || mongoose.model("kudosuUsers", KudosuUserSchema);
