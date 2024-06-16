import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            time: String,
            required: true
        },
        description: {
            time: String,
            required: true
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video" 
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User" 
        }
    },
    {
        timestamps: true
    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema)