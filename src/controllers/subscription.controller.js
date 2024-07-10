import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscription = await User.findById(channelId)

    subscription.Issubscribed = !subscription.Issubscribed
    await subscription.save({ valivalidateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscription, "Subscription updated successfully")
    )
})



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // if (!channelId) {
    //     throw new ApiError(400, "channelId is missing")
    // }

    const subscribers = await Subscription.find({channel: channelId})
    if (!subscribers) {
        throw new ApiError("Error while fetching the subscribers list")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "Subscribers list fetched successfully")
    )
})



// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    // if (!subscriberId) {
    //     throw new ApiError(400, "subscriberId is missing")
    // }

    const subscribedChannels = await Subscription.find({subscriber: subscriberId})
    if (!subscribedChannels) {
        throw new ApiError(500, "Error while fetching the subscribed channels")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
    )
})



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}