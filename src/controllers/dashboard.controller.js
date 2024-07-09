import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const likes = await Like.find({likedBy: req.user?._id})
    const videos = await Video.find({owner: req.user?._id})
    const subscribers = await Subscription.find({channelId: req.user?._id}) 
    
    return res
    .status(200)
    .json(
        new ApiResponse
        (
            200, 
            { 
                TotalLikes: likes.length,
                TotalVideos: videos.length,
                TotalSubscribers: subscribers.length,
                TotalViews: [videos.map((video) => 
                    [video.views, video._id]
                )] 
            },
            "Channel status fetched"
        )
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({owner: req.user?._id})
    if (!videos) {
        throw new ApiError(500, "Error while fetching the videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "All the videos uploaded by the channel are fetched")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }