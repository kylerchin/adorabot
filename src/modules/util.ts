export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

//removes all duplicates from an array and returns a cleaned array
//stolen from https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array

//only works for arrays, but it has N(O)

export function uniq(a) {
  var seen = {};
  return a.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

export function hexCodeToColorNumber(hexBoi) {
  const extractHex = hexBoi.replace(/#/g, '')

  //Add 0x and give it to parse int
  const colorNumber = parseInt("0x" + extractHex)

  return colorNumber

}


//steal from discord.js v13
export function splitMessage(text: String, { maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}) {
  if (text.length <= maxLength) return [text];
  let splitText = [text];
  if (Array.isArray(char)) {
    while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
      const currentChar = char.shift();
      if (currentChar instanceof RegExp) {
        splitText = splitText.flatMap(chunk => chunk.match(currentChar));
      } else {
        splitText = splitText.flatMap(chunk => chunk.split(currentChar));
      }
    }
  } else {
    splitText = text.split(char);
  }
  if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
  const messages = [];
  let msg = '';
  for (const chunk of splitText) {
    if (msg && (msg + char + chunk + append).length > maxLength) {
      messages.push(msg + append);
      msg = prepend;
    }
    msg += (msg && msg !== prepend ? char : '') + chunk;
  }
  return messages.concat(msg).filter(m => m);
}