const md5 = require("js-md5");
const crypto = require("crypto");
const eccrypto = require("eccrypto");

/**
 * Get MD5 hash from string.
 * @param {string} string
 */
function getHash(string) {
  const hash = md5(string.toString());
  return hash;
}

const algorithm = "aes256";

function encryptBuffer(buffer, encryptionPassword = null) {
  const password = encryptionPassword
    ? encryptionPassword
    : process.env.encryptionPassword;
  const cipher = crypto.createCipher(algorithm, password);
  const ciphered = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return ciphered;
}

function decryptBuffer(buffer, encryptionPassword = null) {
  const password = encryptionPassword
    ? encryptionPassword
    : process.env.encryptionPassword;
  const decipher = crypto.createDecipher(algorithm, password);
  const dec = Buffer.concat([decipher.update(buffer), decipher.final()]);
  return dec;
}

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, process.env.encryptionPassword);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(text) {
  var decipher = crypto.createDecipher(
    algorithm,
    process.env.encryptionPassword
  );
  var dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports.getHash = getHash;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.encryptBuffer = encryptBuffer;
module.exports.decryptBuffer = decryptBuffer;
