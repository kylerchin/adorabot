var forEach = require("for-each")

const userIDsRegex = /^(?:<@\D?)?(\d+)(?:>)?\s*,?\s*/;

export function banGuildMember(message) {
    //check if user trying to do the command has permissions
    if(message.member.hasPermission('BAN_MEMBERS')) {
        message.reply("You have the permission to ban!")
    } else {
        message.reply("You do not have permission to ban users in this guild.")
    }

    var userIdArray = []

    forEach(userIdArray, function() {
        
    })

}