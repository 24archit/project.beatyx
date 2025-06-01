const QueueDb = require('../models/queue');
const { getAudioLink } = require('./getAudioLink');

async function getPreviousAudioLink(queueId){
    try{
        const queue = await QueueDb.findOne({ _id: queueId }).exec();
        if (!queue) {
            throw new Error("Queue is empty");
        }
        let currTrack = queue.currTrack;
        let attempts = 0;
        let audioLink = null;
        if (currTrack - 1 < 0) {
            const lastTrackId = queue.queue[currTrack].track.id;
            return await getAudioLink(lastTrackId);
        }
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
            const trackName = previousTrack.track.name ? previousTrack.track.name : null;
            const trackImg = previousTrack.track.album.images[0].url ? previousTrack.track.album.images[0].url : null;
            audioLink = await getAudioLink(previousTrackId);
            if (audioLink) {
                const trackInfo = {
                    trackName: trackName,
                    imgSrc: trackImg,
                    audioLink: audioLink,
                }
                return trackInfo;
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