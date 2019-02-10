const md5 = require("js-md5");

/**
 * Get MD5 hash from string.
 * @param {string} string
 */
function getHash(string) {
  const hash = md5(string);
  return hash;
}

module.exports.getHash = getHash;
