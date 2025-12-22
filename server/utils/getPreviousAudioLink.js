// server/utils/getPreviousAudioLink.js
const QueueDb = require('../models/queue');
const { getAudioLink } = require('./getAudioLink');

async function getPreviousAudioLink(queueId) {
    try {
        const queue = await QueueDb.findOne({ _id: queueId }).exec();
        if (!queue) {
            throw new Error("Queue is empty");
        }
        
        let currTrack = queue.currTrack;
        let attempts = 0;
        let audioLink = null;

        // CASE 1: Start of Queue - Replay First Track
        if (currTrack - 1 < 0) {
            const firstTrack = queue.queue[currTrack];
            const firstTrackId = firstTrack.track.id;
            
            audioLink = await getAudioLink(firstTrackId);
            
            if (audioLink) {
                return {
                    id: firstTrackId,
                    trackName: firstTrack.track.name || "Unknown Track",
                    imgSrc: firstTrack.track.album.images[0]?.url || "",
                    audioLink: audioLink,
                    artistNames: firstTrack.track.artists 
                        ? firstTrack.track.artists.map(a => a.name) 
                        : ["Unknown Artist"]
                };
            }
            return null;
        }

        // CASE 2: Previous Track in Queue
        while (attempts < 6) {
            const previousTrack = queue.queue[currTrack - 1];
            if (!previousTrack) {
                throw new Error("No more tracks in the queue");
            }

            await QueueDb.updateOne(
                { _id: queueId },
                { $inc: { currTrack: -1 } }
            ).exec();
            currTrack--;

            const previousTrackId = previousTrack.track.id;
            const trackName = previousTrack.track.name || "Unknown Track";
            const trackImg = previousTrack.track.album.images[0]?.url || "";
            
            audioLink = await getAudioLink(previousTrackId);

            if (audioLink) {
                return {
                    id: previousTrackId, // ID explicitly included
                    trackName: trackName,
                    imgSrc: trackImg,
                    audioLink: audioLink,
                    artistNames: previousTrack.track.artists 
                        ? previousTrack.track.artists.map(a => a.name) 
                        : ["Unknown Artist"]
                };
            }

            attempts++;
            console.warn(
                `Attempt ${attempts}: Failed to fetch audio link for track ID ${previousTrackId}. Retrying...`
            );
        }
        throw new Error("Failed to fetch a valid audio link after 6 attempts");
    } catch (error) {
        console.error(
            "Error fetching the previous audio link:",
            error.message || error
        );
        return null;
    }
} 

module.exports = { getPreviousAudioLink };