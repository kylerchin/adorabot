interface replyOrFollowUpInterface {
    messageorinteraction: any,
    content: any
}

export function replyorfollowup(options: replyOrFollowUpInterface) {
    var {messageorinteraction, content} = options;

    if (typeof messageorinteraction.commandName != "undefined") {
            return messageorinteraction.followUp(content)
    } else {
       return messageorinteraction.reply(content)
    }
}