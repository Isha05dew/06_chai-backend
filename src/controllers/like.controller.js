import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError("videoId is required");
  }

  const video = await Video.findById(videoId);
  const user = await User.findById(req.user?._id);

  video.isLiked = !video.isLiked;
  await video.save({ validateBeforeSave: false });

  let like;
  if (video.isLiked) {
    like = await Like.create({
      video,
      likedBy: user,
    });
  } else {
    await Like.find({
      $and: {
        likedBy: user,
        video: videoId,
      },
    }).deleteOne();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        Isvideoliked: video.isLiked,
        like: video.isLiked ? like : "Null",
      },
      video.isLiked ? "Video Liked" : "Video Disliked"
    )
  );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!commentId) {
    throw new ApiError("commentId is required");
  }

  const comment = await Comment.findById(commentId);
  const user = await User.findById(req.user?._id);

  comment.isLiked = !comment.isLiked;
  await comment.save({ validateBeforeSave: false });

  let like;
  if (comment.isLiked) {
    like = await Like.create({
      comment,
      likedBy: user,
    });
  } else {
    await Like.find({
      $and: {
        likedBy: user,
        comment: commentId,
      },
    }).deleteOne();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        Iscommentliked: comment.isLiked,
        like: comment.isLiked ? like : {},
      },
      comment.isLiked ? "Video Liked" : "Video Disliked"
    )
  );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError("tweetId is required");
  }

  const tweet = await Tweet.findById(tweetId);
  const user = await User.findById(req.user?._id);

  tweet.isLiked = !tweet.isLiked;
  tweet.save({ validateBeforeSave: false });

  let like;
  if (tweet.isLiked) {
    like = await Like.create({
      tweet,
      likedBy: user,
    });
  } else {
    await Like.find({
      $and: {
        likedBy: user,
        tweet: tweetId,
      },
    }).deleteOne();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isTweetLiked: tweet.isLiked,
        like,
      },
      tweet.isLiked ? "Tweet Liked" : "Tweet Disliked"
    )
  );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const videos = await Video.find({ isLiked: true })

  return res
  .status(200)
  .json(
    new ApiResponse(200, videos, "All Liked Videos Fetched Successfully")
  )
  
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
