import {uploadStringToNewRelic} from './newRelic';

interface replyOrFollowUpInterface {
    messageorinteraction: any,
    content: any,
    tryagaininfiveseconds?: boolean
}

export function replyorfollowup(options: replyOrFollowUpInterface) {
    var {messageorinteraction, content} = options;

    try {
        if (messageorinteraction) {
            
        if (typeof messageorinteraction.commandName != "undefined") {
            if (messageorinteraction.deferred) {
                return messageorinteraction.followUp(content).catch((error) => {
                    messageorinteraction.reply(content).catch((error) => {console.log(error)})
                    console.error(error);
                    uploadStringToNewRelic(JSON.stringify({...error, type: "replyorfollowuperror"}));
                })
            } else {
                return messageorinteraction.reply(content).catch((error) => {
                    messageorinteraction.followUp(content).catch((error) => {console.log(error)});
                    console.error(error);
                    uploadStringToNewRelic(JSON.stringify({...error, type: "replyorfollowuperror"}));
                })
            }
    } else {
       return messageorinteraction.reply(content)
    }
        }

    } catch (error) {
        console.error(error);

        uploadStringToNewRelic(JSON.stringify({...error, type: "replyorfollowuperror"}));

        return false;
    }
}