import { Message } from "discord.js";

//var Youtube = require('youtube.com-extended');
const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const { generateGif } = require("youtube-giffify");
interface makeGifInterface {
    message: Message,
    args: any;
}

export async function makeGif(makeGifArgs:makeGifInterface) {
    await makeGifArgs.message.reply("Making your gif! This might take a while...")
     
    var fileNamed = `${genRanHex(8)}`

// In async function
const res = await generateGif(
    makeGifArgs.args[0], // Youtube video url
    `${__dirname}/../../${fileNamed}.gif`, // Output file path
    {
      // Options
      fps: 24,
      startInSeconds: makeGifArgs.args[1],
      duration: makeGifArgs.args[2]

    }
  ).then(makeGifArgs.message.reply({
    content: "Your gif is done!",
    files: [`${__dirname}/../../${fileNamed}.gif`]
}));
/*
    Youtube(makeGifArgs.args[0]).gif(makeGifArgs.args[1], makeGifArgs.args[2], `./../../${genRanHex(8)}.gif`)
    .then(function () {
        console.log("Done");
        makeGifArgs.message.reply({
            content: "Your gif is done!",
            files: [`./../../${genRanHex(8)}.gif`]
        })
    }).catch(function (err) {
        console.log("err : ", err)
    });*/
}