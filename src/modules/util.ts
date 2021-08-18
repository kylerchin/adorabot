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
  return a.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

export  function hexCodeToColorNumber(hexBoi) {
  const extractHex = hexBoi.replace(/#/g, '')

            //Add 0x and give it to parse int
            const colorNumber = parseInt("0x" + extractHex)

return colorNumber

}