const { Contract, Wallet, providers, utils } = require("ethers");
const ProofContract = require("../../blockchain/build/contracts/ProofOfOwnership.json");
const ipfs = require("./ipfs.js");
const Hashing = require("./hashing.js");

// Set provider
// Once a Ganache node is running, it behaves very similar to a
// JSON-RPC API node.
const url = "http://localhost:7545";
const provider = new providers.JsonRpcProvider(url);

// Get contract and set wallet
const wallet = new Wallet(process.env.walletKey, provider);
const contractAddress = ProofContract.networks[process.env.networkId].address;
const contract = new Contract(contractAddress, ProofContract.abi, wallet);

/**
 *  Save the proof of ownership using the smart contract.
 * @param {string} hash
 * @param {string} owner
 */
async function saveProof(buffer, owner) {
  // Save the file on IPFS
  const ipfsHash = await ipfs.saveFile(buffer);

  // Hash the document
  const hash = Hashing.getHash(buffer);

  // Save the proof in the blockchain
  const results = await contract.saveProof(hash, owner, ipfsHash);

  // Return the IPFS in the results
  results.ipfsHash = ipfsHash;
  return results;
}

/**
 * Get the proof of ownership from the hash.
 * @param {string} hash
 */
async function getProof(buffer) {
  // Hash the document
  hash = Hashing.getHash(buffer);
  const res = await contract.getProof(hash);
  return {
    owner: res[0],
    date: new Date(res[1].toString() * 1000) // Parse timestamp
  };
}

module.exports.saveProof = saveProof;
module.exports.getProof = getProof;
