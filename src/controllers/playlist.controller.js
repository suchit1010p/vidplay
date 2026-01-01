import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name = "", description = "" } = req.body;
    const userId = req.user._id;

    if (!name.trim()) {
        throw new ApiError(400, "Playlist name is required");
    }

    const newPlaylist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: userId
    });

    return res.status(201).json(
        new ApiResponse(201, newPlaylist, "Playlist created successfully")
    );
});

// Get User Playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId });

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

// Get Single Playlist with Videos
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId).populate(
        "videos",
        "title thumbnail duration owner"
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

// Add Video to Playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID format");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "Not authorized to modify this playlist");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (playlist.videos.some(id => id.toString() === videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

// Remove Video from Playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID format");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "Not authorized to modify this playlist");
    }

    if (!playlist.videos.some(id => id.toString() === videoId)) {
        throw new ApiError(404, "Video not found in playlist");
    }

    playlist.videos = playlist.videos.filter(
        id => id.toString() !== videoId
    );
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

// Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "Not authorized to delete");
    }

    await playlist.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Playlist deleted successfully")
    );
});

// Update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "Not authorized to update this playlist");
    }

    if (name && name.trim()) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description.trim();

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
