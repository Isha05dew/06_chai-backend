import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 2 } = req.query;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(limit);

  if (!comments) {
    throw new ApiError("Getting Eroor while fetching the comments");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments, count: comments.length },
        "Comments fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  // console.log("Before User fetched");

  const owner = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  // console.log("User fetched");

  const video = await Video.findById(videoId);
  // console.log("Video fetched");

  const comment = await Comment.create({
    content,
    owner,
    video,
  });
  console.log("Comment created");

  const Commentedvideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "videoComments",
      },
    },
    // {
    //     $addFields: {
    //         videoComments: {
    //             $first: "$comments"
    //         }
    //     }
    // },
    {
      $addFields: {
        //$set can also be used
        videoComments: {
          $concatArrays: ["$videoComments", [comment]],
        },
      },
    },

    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        duration: 1,
        isPublished: 1,
        owner: 1,
        views: 1,
        videoComments: 1,
      },
    },
  ]);
  console.log("Comment added");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comment, Commentedvideo },
        "Comment added successfully"
      )
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Invalid url");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Invalid url");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "This comment doesn't exists");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
