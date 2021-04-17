const Jimp = require('jimp');
const jsQR = require('jsqr');
const request = require('request-promise-native');
import { logger } from './logger';
 
process.on( 'unhandledRejection', console.error );
 
 
export async function onMessageForQR( message ) {
    //console.log("onMessageForQR")
     if( await checkMessage( message ) )
        await deleteMessage( message );
 
    return;
};
 
 
 
 
export async function onMessageUpdateForQR( messageOld, messageNew ) {
    const message = messageNew.partial ? await messageNew.fetch( ) : messageNew;
 
    if( await checkMessage( message ) )
        await deleteMessage( message );
 
    return;
};
 
 
 
//~ Helper functions below...
 
 
 
//~ Returns true if the message contains a login QR code...
async function checkMessage( { attachments, author, embeds } ) {
    if( author.bot ) return;
 
    const urls    =       getURLs( { attachments, embeds } );
    const buffers = await getBuffers( urls );
    const bitmaps = await getBitmaps( buffers );
 
    return checkBitmaps( bitmaps );
}
 
 
 
//~ Delete the message and notify the author...
async function deleteMessage( message ) {
    const { author, channel } = message;
       
    await logger.discordInfoLogger.info({type: "foundScamQRCode", messageObject: message, guildName: message.guild.name})

    await Promise.all( [
        //message.delete( ).catch(),
        //channel.send( `<@${ author.id }> - Our rules forbid the posting of quick response codes which are used to login.` ).catch()
        message.reply(
            {
                "embed": {
                  "title": ":warning: Warning! This is a dangerous QR code that can hack your discord account! :warning: ",
                  "description": "The QR code above contains a Discord Login link, which if scanned, can allow an attacker to login and take over your account. Often scammers will pretend the qr codes are free nitro or other gifts. DO NOT SCAN IT!"
                }
              }
        ).then(
            async (sentWarningMessageScamQRCOde) => {
                await logger.discordInfoLogger.info({type: "sentWarningMessageScamQRCode", messageObject: sentWarningMessageScamQRCOde})
            }
        ).catch(
            async (brokenQRCodeSendoutProtection) => {
                await logger.discordWarnLogger.warn({type: "FailedToSendWarningMessageScamQRCode", error: brokenQRCodeSendoutProtection}, brokenQRCodeSendoutProtection)
            }
        )
    ] );
 
    return;
}
 
 
 
//~ Get an array of bitmaps form the image buffers...
async function getBitmaps( buffers ) {
    return await Promise.all(
        buffers.map( buffer => Jimp.read( buffer ).then( ( { bitmap } ) => bitmap ) )
    );
}
 
 
 
//~ Get buffers from an array of URLs...
async function getBuffers( urls ) {
    return await Promise.all(
        urls.map( url => request( { encoding: null, uri: url } ) )
    );
}
 
 
 
//~ Check the bitmaps for login QR codes...
function checkBitmaps( bitmaps ) {
    return bitmaps.some( bitmap => {
        const results = jsQR( bitmap.data, bitmap.width, bitmap.height );
 
        const discordScamRegex = new RegExp('discord(app)?\.com/ra/', 'g');
        return !!( results && (results.data.match(discordScamRegex) ) );
    } );
}
 
 
 
//~ Get all image URLs form attachments, embeds, etc...
function getURLs( { attachments, embeds } ) {
    const urls = [ ];
 
    attachments.forEach( ( { height, width, url } ) => {
        if( height && width ) urls.push( url );
    } );
 
    embeds.forEach( ( { thumbnail, type, url } ) => {
        if( thumbnail )       urls.push( thumbnail.proxyURL || thumbnail.url );
    } );
 
    return urls;
}