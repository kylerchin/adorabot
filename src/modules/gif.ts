import { Message } from "discord.js";

var Youtube = require('youtube.com-extended');
const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

interface makeGifInterface {
    message: Message,
    args: any;
}

export async function makeGif(makeGifArgs:makeGifInterface) {
    await makeGifArgs.message.reply("Making your gif! This might take a while...")

    Youtube(makeGifArgs.args[0]).gif(makeGifArgs.args[1], makeGifArgs.args[2], `./../../${genRanHex(8)}.gif`)
    .then(function () {
        console.log("Done");
        makeGifArgs.message.reply({
            content: "Your gif is done!",
            files: [`./../../${genRanHex(8)}.gif`]
        })
    }).catch(function (err) {
        console.log("err : ", err)
    });
}