export async function alertBotAdder(guild,client) {
    let auditLog = await guild.fetchAuditLogs({type: 'CREATE'}).catch(err => undefined)
//let sendTarget
if(!auditLog) {
  //do nothing
}
else{
    let botCreate = auditLog.entries.filter(e => e.action == 'BOT_ADD' && e?.target.id == client.user.id).map(item => item);
    if(botCreate.length) {
        console.log(botCreate)
       var  sendTarget = botCreate[0].executor
       if (sendTarget) {
        //sendTarget.send()
        return true;
    }
      }
}
}