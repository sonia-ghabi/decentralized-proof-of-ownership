const { Contract, Wallet, providers } = require("ethers");
const ProofContract = require("../../blockchain/build/contracts/ProofOfOwnership.json");
const ipfs = require("./ipfs.js");
const CryptoUtils = require("./cryptoUtils");
const uuidv1 = require("uuid/v1");
const eccrypto = require("eccrypto");
const sharp = require("sharp");
const path = require("path");
const sec = require("secp256k1");

// Set provider
// Once a Ganache node is running, it behaves very similar to a
// JSON-RPC API node.
const url = process.env.ETH_PROVIDER;
const provider = new providers.JsonRpcProvider(url);

// Get contract and set wallet
const wallet = new Wallet(process.env.walletKey, provider);
wallet.getAddress().then(addr => console.log(`Wallet address: ${addr}`));
wallet.getBalance().then(bn => console.log(`Wallet balance: ${bn.toString()}`));
const contractAddress = ProofContract.networks[process.env.networkId].address;
const contract = new Contract(contractAddress, ProofContract.abi, wallet);

/**
 *  Save the proof of ownership using the smart contract.
 * @param {string} hash
 * @param {string} owner
 * @param {Buffer} userPublicKey
 */
async function saveProof(buffer, owner, userPublicKey) {
  // Save the watermarked file on IPFS
  const watermarked = sharp(buffer).overlayWith(
    path.join(__basedir, "../ressources/watermark.png")
  );
  const ipfsHash = await ipfs.saveFile(watermarked);

  // Encrypt the file and save it on IPFS
  const guid = uuidv1();
  const encryptedBuffer = CryptoUtils.encryptBuffer(buffer, guid);
  const ipfsHashEncrypted = await ipfs.saveFile(encryptedBuffer);

  // Encrypt the encryption key with the user public key
  const encryptedKey = await eccrypto.encrypt(
    Buffer.from(userPublicKey, "hex"),
    Buffer.from(guid)
  );
  //To decrypt
  //const decrypt = await eccrypto.decrypt(p, encryptedKey);
  //console.log(decrypt.toString("ascii"));

  // Hash the document
  const hash = CryptoUtils.getHash(buffer);

  // Save the proof in the blockchain
  const results = await contract.saveProof(
    hash,
    owner,
    ipfsHash,
    ipfsHashEncrypted,
    JSON.stringify(encryptedKey)
  );

  // Return the IPFS hashs in the results
  results.ipfsHashEncrypted = ipfsHashEncrypted;
  results.encryptedKey = encryptedKey;
  results.ipfsHash = ipfsHash;
  results.id = hash;
  return results;
}

/**
 * Register the usage rights for the buyer.
 * @param {*} buyer
 * @param {*} owner
 * @param {*} proof
 */
async function registerUsageRights(buyer, owner, proof) {
  // Decrypt the owner private key
  const decryptedPrivateKey = CryptoUtils.decryptBuffer(
    Buffer.from(owner.encryptedPrivateKey, "hex")
  );

  // Use the private key to decrypt the file encryption key
  const encryptionKey = await eccrypto.decrypt(
    decryptedPrivateKey,
    proof.encryptedKey
  );

  // Re-encrypt the file encryption key with the buyer public key
  const buyerEncryptionKey = await eccrypto.encrypt(
    Buffer.from(buyer.publicKey, "hex"),
    encryptionKey
  );

  // Register the usage rights in the blockchain
  await contract.registerUsageRights(
    proof.id,
    JSON.stringify(buyerEncryptionKey),
    buyer.id
  );

  // Decrypt the file encryption key with the buyer private key
  /*
  const decryptedPrivateKey = CryptoUtils.decryptBuffer(
    Buffer.from(buyer.encryptedPrivateKey, "hex")
  );
  let key = await eccrypto.decrypt(decryptedPrivateKey, sell);
  key = key.toString("ascii");
  */

  // Return the encryption key
  return encryptionKey.toString("ascii");
}

/**
 * Get the proof of ownership for the given image.
 * @param {buffer} buffer
 */
async function getProof(buffer) {
  // Hash the document
  hash = CryptoUtils.getHash(buffer);
  const res = await contract.getProof(hash);
  return {
    owner: res[0],
    date: new Date(res[1].toString() * 1000) // Parse timestamp
  };
}

module.exports.saveProof = saveProof;
module.exports.getProof = getProof;
module.exports.registerUsageRights = registerUsageRights;
