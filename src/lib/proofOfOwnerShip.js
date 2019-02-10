const { Contract, Wallet, providers, utils } = require("ethers");
const PooContract = require("../../blockchain/build/contracts/ProofOfOwnership.json");

// Set provider
// Once a Ganache node is running, it behaves very similar to a
// JSON-RPC API node.
const url = "http://localhost:7545";
const provider = new providers.JsonRpcProvider(url);

// Get contract and set wallet
const wallet = new Wallet(process.env.walletKey, provider);
const contractAddress = PooContract.networks[process.env.networkId].address;
const contract = new Contract(contractAddress, PooContract.abi, wallet);

/**
 *  Save the proof of ownership using the smart contract.
 * @param {string} hash
 * @param {string} owner
 */
async function saveProof(hash, owner) {
  try {
    return contract.saveProof(hash, utils.getAddress(owner));
  } catch (e) {
    console.log(e);
    throw new Error("Couldn't save proof of ownership");
  }
}

/**
 * Get the proof of ownership from the hash.
 * @param {string} hash
 */
async function getProof(hash) {
  try {
    const res = await contract.getProof(hash);
    return {
      owner: res[0],
      date: new Date(res[1].toString() * 1000) // Parse timestamp
    };
  } catch (e) {
    console.log(e);
    throw new Error("Couldn't get proof of ownership");
  }
}

module.exports.saveProof = saveProof;
module.exports.getProof = getProof;
