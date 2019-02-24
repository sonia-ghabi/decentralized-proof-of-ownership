const ipfsClient = require("ipfs-http-client");

// Run with local daemon
var ipfs = ipfsClient(process.env.IPFS_API);

/**
 * Saves the file on IPFS.
 * @param {buffer instance} buffer
 */
async function saveFile(buffer) {
  const results = await ipfs.add(buffer);
  return results[0].hash;
}

module.exports.saveFile = saveFile;
