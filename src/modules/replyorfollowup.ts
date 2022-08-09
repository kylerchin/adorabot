interface replyOrFollowUpInterface {
    messageorinteraction: any,
    content: any
}

export function replyorfollowup(options: replyOrFollowUpInterface) {
    var {messageorinteraction, content} = options;

    try {
        if (messageorinteraction) {
            
        if (typeof messageorinteraction.commandName != "undefined") {
            return messageorinteraction.followUp(content)
    } else {
       return messageorinteraction.reply(content)
    }
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}