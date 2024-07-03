import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
  console.log(req.query);
  const { page = 1, limit = 1, query, sort, sortType, userId } = req.query;
  const skip = (page - 1) * limit;

  let apiData = Video.find(query);
  if (sort) {
    let sortFix = sort.replace(",", " ");
    // queryObject.sort = sortFix
    apiData = apiData.sort(sortFix);
  }

  const videos = await apiData.skip(skip).limit(limit);
  // .sort("-title views")
  // .sort(sort)

  if (!videos) {
    throw new ApiError("Error while fetching all the videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, Count: videos.length },
        "All videos fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].some((field) => field?.trim == "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  // const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);

  // console.log(videoFile);

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  console.log("after thumbnail has upload");

  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const owner = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  console.log("After owner gets");

  const video = await Video.create({
    title: title.toUpperCase(),
    description,
    videoFile: videoFile.url,
    duration: videoFile.duration,
    thumbnail: thumbnail.url,
    isPublished: true,
    owner: owner,
    views: 1,
  });
  console.log("after video created");

  if (!video) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video Created Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  // console.log(isValidObjectId(new mongoose.Types.ObjectId(videoId)));

  const video = await Video.findById(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video is fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;

  if (!title || !description || !thumbnailLocalPath) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video details are updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "This video doesn't exists");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
