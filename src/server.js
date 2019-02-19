global.__basedir = __dirname;
require("dotenv").config();
const Hashing = require("./lib/hashing.js");
const ProofOfOwnership = require("./lib/proofOfOwnership");
const Database = require("./lib/database.js");
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Initialize express config
const app = express();
const port = 4000;
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public")));

const crypto = require("crypto");
const eccrypto = require("eccrypto");

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors());

// Initialize the database helper
const db = new Database();

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
    const userId = await db.verifyToken(req.body.idToken);
    const userKeys = await db.readData("user", userId);

    // Save the proof of ownership in the blockchain
    const tx = await ProofOfOwnership.saveProof(
      req.file.buffer,
      userId,
      userKeys.public
    );
    const toWrite = {
      owner: userId,
      date: Date.now(),
      fileName: req.body.fileName,
      encryptedKey: tx.encryptedKey
    };
    // Save it in the database
    await db.writeData("proof", toWrite, tx.ipfsHash);
    res.send(toWrite);
  } catch (e) {
    console.log(e);
    res
      .status(500) // HTTP status 404: NotFound
      .send("Internal server error");
  }
});

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

app.post("/generateKeys", async function(req, res) {
  const token = req.body.idToken;

  // Verify the token
  const userId = await db.verifyToken(token);

  // Generate the key
  var privateKey = crypto.randomBytes(32);
  var publicKey = eccrypto.getPublic(privateKey);
  const user = {
    public: publicKey,
    private: Hashing.encryptBuffer(privateKey)
  };
  db.writeData("user", user, userId);
  res.status("200").send();
});

app.get("/load", async function(req, res) {
  const data = await db.readAll("proof");
  res.json({ res: data });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
