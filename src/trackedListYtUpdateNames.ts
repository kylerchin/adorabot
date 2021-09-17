import { cassandraclient } from "./modules/cassandraclient";
import * as youtubei from "youtubei";
import { addVideoToTrackList } from "./youtubeviewcountdaemon";
const youtube = new youtubei.Client();

const query = "SELECT * FROM adorastats.trackedytvideosids"

cassandraclient.execute(query).then(async (result) => {
    result.rows.forEach(async (row) => {
        const video = await youtube.getVideo(row.videoid);

        addVideoToTrackList(row.videoid,video.title)

        console.log("added " + video.title)
    })
   
})