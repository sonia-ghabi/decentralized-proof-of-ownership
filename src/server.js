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
const crypto = require("crypto");
const eccrypto = require("eccrypto");

// Initialize express config
const app = express();
const port = 4000;
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public")));

// Set CORS
const corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));

/**
 * Get the proof of ownership from the blockchain.
 * GET Params:
 *   hash: the document hash
 */
app.get("/proof/:hash", async function(req, res) {
  const hash = req.params.hash;
  try {
    const tx = await ProofOfOwnership.getProof(hash);
    res.send(tx);
  } catch (e) {
    res.send(e.message);
  }
});

/**
 * Register a new proof of ownership.
 * Body:
 * {
 *    doc: string
 *    owner: string
 * }
 */
app.post("/", upload.single("img"), async function(req, res) {
  try {
    // Verify the token
    const userId = await Database.verifyToken(req.body.idToken);
    const userKeys = await Database.readData("user", userId);

    // Save the proof of ownership in the blockchain
    const tx = await ProofOfOwnership.saveProof(
      req.file.buffer,
      userId,
      userKeys.public
    );

    // Build the object to write in the database
    const toWrite = {
      owner: userId,
      date: Date.now(),
      fileName: req.body.fileName,
      encryptedKey: tx.encryptedKey
    };

    // Save it in the database
    await Database.writeData("proof", toWrite, tx.ipfsHash);

    // Return the response
    res.send(toWrite);
  } catch (e) {
    console.log(e);
    res
      .status(500) // HTTP status 500: Internal server error
      .send("Internal server error");
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
    console.log(e);
    res
      .status(404) // HTTP status 404: NotFound
      .send("Not found");
  }
});

/**
 *
 */
app.post("/generateKeys", async function(req, res) {
  // Verify the token
  const userId = await Database.verifyToken(req.body.idToken);
  Database.writeData("user", CryptoUtils.generatePublicPrivateKeys(), userId);
  res.status("200").send();
});

app.get("/load", async function(req, res) {
  const data = await Database.readAll("proof");
  res.json({ res: data });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
