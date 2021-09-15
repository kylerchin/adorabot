import {cassandraclient} from'./cassandraclient'
import {logger} from "./logger"

export function checkMessage(message) {

}

export async function createDatabase() {
    //Goes inside adora moderation keyspace, makes the table "guildssubscribedtoautoban"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.badlinks (link text PRIMARY KEY, type text, addedbyid text, addtime timeuuid);")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));
}