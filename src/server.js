global.__basedir = __dirname;
require("dotenv").config();
const CryptoUtils = require("./lib/cryptoUtils");
const ProofOfOwnership = require("./lib/proofOfOwnership");
const Database = require("./lib/database.js");
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
var request = require("request");
var fs = require("fs");

// Initialize express config
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, '../build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

/**
 * Generate the keys pair for the user.
 * Body:
 * {
 *    idToken
 * }
 */
app.post("/generateKeys", async function(req, res) {
  try {
    // Verify the token
    const userId = await Database.verifyToken(req.body.idToken);

    // Generate the keys and save them in the database (the private key is encrypted)
    Database.writeData("user", CryptoUtils.generatePublicPrivateKeys(), userId);
    res.status("200").send();
  } catch (e) {
    res
      .status(500) // HTTP status 500: Internal server error
      .send(e.message);
  }
});

/**
 * Check whether the given image is already registered in the blockchain.
 */
app.post("/check", upload.single("img"), async function(req, res) {
  try {
    const tx = await ProofOfOwnership.getProof(req.file.buffer);
    res.send(tx);
  } catch (e) {
    res
      .status(404) // HTTP status 404: NotFound
      .send("Not found");
  }
});

/**
 * Register a new proof of ownership.
 * Body:
 * {
 *    file
 *    idToken
 *    name
 *    originalFileName
 * }
 */
app.post("/save", upload.single("img"), async function(req, res) {
  try {
    // Verify the token
    const userId = await Database.verifyToken(req.body.idToken);

    // Retrieve the user keys
    const userKeys = await Database.readData("user", userId);

    // Save the proof of ownership in the blockchain
    const tx = await ProofOfOwnership.saveProof(
      req.file.buffer,
      userId,
      userKeys.publicKey
    );

    // Build the object to write in the database
    const toWrite = {
      owner: userId,
      date: Date.now(),
      fileName: req.body.fileName,
      encryptedKey: tx.encryptedKey,
      ipfsHashEncrypted: tx.ipfsHashEncrypted,
      ipfsHash: tx.ipfsHash,
      originalFileName: req.body.originalFileName
    };

    // Save it in the database
    await Database.writeData("proof", toWrite, tx.id);

    // Return the response
    res.send(toWrite);
  } catch (e) {
    res
      .status(500) // HTTP status 500: Internal server error
      .send(e.message);
  }
});

/**
 * Register a new usage right for the selected image.
 * Body:
 * {
 *    idToken
 *    owner (id)
 *    hash (image to get usage rights for)
 * }
 */
app.post("/getUsageRights", async function(req, res) {
  try {
    // Verify the token
    const buyerId = await Database.verifyToken(req.body.idToken);

    // Retrieve the users and the proof of ownership in the database
    const owner = await Database.readData("user", req.body.owner);
    const buyer = await Database.readData("user", buyerId);
    buyer.id = buyerId;
    const proof = await Database.readData("proof", req.body.hash);
    proof.id = req.body.hash;

    // Register the usage rights
    const key = await ProofOfOwnership.registerUsageRights(buyer, owner, proof);

    // Update the database
    Database.updateData("proof", { users: [buyerId] }, proof.id);
    Database.updateData("user", { rights: [proof.id] }, buyer.id);

    // Get the file from IPFS
    var options = {
      url: process.env.IPFS_GATEWAY + proof.ipfsHashEncrypted,
      method: "get",
      encoding: null
    };
    request(options, function(error, response, body) {
      if (error) {
        console.error("error:", error);
      } else {
        body = CryptoUtils.decryptBuffer(body, key);
        res.send(body); // Send the image in the response
      }
    });
  } catch (e) {
    res
      .status(500) // HTTP status 500: Internal server error
      .send(e.message);
  }
});

/**
 * Get all the proof of ownership.
 */
app.get("/load", async function(req, res) {
  try {
    const data = await Database.readAll("proof");
    res.json({ res: data });
  } catch (e) {
    res
      .status(500) // HTTP status 500: Internal server error
      .send(e.message);
  }
});

/*
app.get("/decrypt:buyer", async function(req, res) {
  const buyer = await Database.readData("user", req.params.buyer);
  const decryptedPrivateKey = CryptoUtils.decryptBuffer(
    Buffer.from(buyer.encryptedPrivateKey, "hex")
  );
  let key = await eccrypto.decrypt(decryptedPrivateKey, sell);
  key = key.toString("ascii");

  /*
  const toWrite = {
    key: sell,
    image: ipfsHash,
    buyer: buyer.id
  };
  await Database.writeData("sell", toWrite, "0");

  var options = {
    url: "http://localhost:8080/ipfs/" + proof.ipfsHashEncrypted,
    method: "get",
    encoding: null
  };

  console.log("Requesting image..");
  request(options, function(error, response, body) {
    if (error) {
      console.error("error:", error);
    } else {
      body = CryptoUtils.decryptBuffer(body, key);
      fs.writeFileSync("test.jpg", body);
    }
  });
});
*/

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
