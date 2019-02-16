const ipfsClient = require("ipfs-http-client");

// Run with local daemon
var ipfs = ipfsClient("/ip4/127.0.0.1/tcp/5001");

/**
 * Saves the file on IPFS.
 * @param {buffer instance} buffer
 */
async function saveFile(buffer) {
  const results = await ipfs.add(buffer);
  return results[0].hash;
}

module.exports.saveFile = saveFile;
