import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js" 
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body 
    //TODO: create playlist

    if (!name && !description) {
        throw new ApiError("PlayList Name and Description is required")
    }
    const user = await User.findById(req.user?._id)

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: user
    })
    if (!playlist) {
        throw new ApiError("Something went wrong while creating a playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist is created successfully")
    )
})




const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    const playlists = await Playlist.find({owner: userId})
    if (!playlists) {
        throw new ApiError("Error while fetching user playlists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    )
})




const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError("Error while fetching a playlist")
    }

    return res
    .status(200) 
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})




const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if ( !playlistId || !videoId ) {
        throw new ApiError("playlistId and videoId is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError("Error while fetching the video")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError("Error while fetching the playlist")
    }

    playlist.videos.push(video)
    await playlist.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )

})




const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if ( !playlistId || !videoId ) {
        throw new ApiError("playlistId and videoId is required")
    }
    
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError("Invalid playlistId")
    }
 

    const index = playlist.videos.indexOf(videoId)
    console.log(index);
    if (index > -1) {
        // Only splice the array when the item is found
        playlist.videos.splice(index, 1); // The second parameter means remove one item only
    }
    
    // Resulting array: 
    console.log(playlist.videos);  
    await playlist.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video deleted from playlist successfully")
    )

})




const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    await Playlist.findById(playlistId).deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})




const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId) {
        throw new ApiError("playlistId is required")
    }
    if (!name && !description) {
        throw new ApiError("Name or description is required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {new: true}
    )
    if (!playlist) {
        throw new ApiError("Something went wrong while updating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )
})





export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}