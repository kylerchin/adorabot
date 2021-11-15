import editJsonFile = require("edit-json-file");
let fileOfBanTimeouts = editJsonFile(`${__dirname}/../putgetbanstimeout.json`);
export function isServerBanNotRateLimited(serverid) {
    if ( fileOfBanTimeouts.get(serverid)) {
        var idRateInfo =  fileOfBanTimeouts.get(serverid)
        if (idRateInfo.time + idRateInfo.timeout < Date.now()) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}