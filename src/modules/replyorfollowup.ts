import {uploadStringToNewRelic} from './newRelic';

interface replyOrFollowUpInterface {
    messageorinteraction: any,
    content: any,
    tryagaininfiveseconds?: boolean,
    components?:any
}

export function replyorfollowup(options: replyOrFollowUpInterface) {
    var {messageorinteraction, content} = options;

    try {
        if (messageorinteraction) {


            const objectToSend:any = content
            
        if (typeof messageorinteraction.commandName != "undefined") {
            if (messageorinteraction.deferred) {
                return messageorinteraction.followUp(objectToSend).catch((error) => {
                    messageorinteraction.reply(objectToSend).catch((error) => {console.log(error)})
                    console.error(error);
                    uploadStringToNewRelic(JSON.stringify({...error, type: "replyorfollowuperror"}));
                })
            } else {
                return messageorinteraction.reply(objectToSend).catch((error) => {
                    messageorinteraction.followUp(objectToSend).catch((error) => {console.log(error)});
                    console.error(error);
                    uploadStringToNewRelic(JSON.stringify({...error, type: "replyorfollowuperror"}));
                })
            }
    } else {
       return messageorinteraction.reply(objectToSend)
    }
        }

    } catch (error) {
        console.error(error);

        uploadStringToNewRelic(JSON.stringify({...error, type: "replyorfollowuperror"}));

        return false;
    }
}