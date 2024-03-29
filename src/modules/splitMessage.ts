/**
 * Verifies the provided data is a string, otherwise throws provided error
 *
 * @param data - The string resolvable to resolve
 * @param error - The Error constructor to instantiate [default: `Error`]
 * @param errorMessage - The error message to throw with [default: "Expected string, got <data> instead."]
 * @param allowEmpty - Whether an empty string should be allowed [default: true]
 */
function verifyString(
    data,
    error = Error,
    errorMessage = `Expected a string, got ${data} instead.`,
    allowEmpty = true,
  ) {
    if (typeof data !== 'string') throw new error(errorMessage);
    if (!allowEmpty && data.length === 0) throw new error(errorMessage);
    return data;
  }
  
  /**
   * Splits a string into multiple chunks at a designated character that do not exceed a specific length
   *
   * @param text - Content to split
   */
  export function splitMessage(text, { maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}) {

    text = verifyString(text);
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