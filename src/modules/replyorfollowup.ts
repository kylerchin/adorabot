interface replyOrFollowUpInterface {
    messageorinteraction: any,
    content: any
}

export function replyorfollowup(options: replyOrFollowUpInterface) {
    var {messageorinteraction, content} = options;

    if (messageorinteraction.commandName) {
            return messageorinteraction.followUp(content)
    } else {
       return messageorinteraction.reply(content)
    }
}