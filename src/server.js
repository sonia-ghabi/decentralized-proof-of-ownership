global.__basedir = __dirname;
require("dotenv").config();
const Hashing = require("./lib/hashing.js");
const ProofOfOwnership = require("./lib/proofOfOwnership");
const Database = require("./lib/database.js");
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
//const upload = multer({ dest: "uploads/" });
const upload = multer({ storage: multer.memoryStorage() });

// Initialize express config
const app = express();
const port = 4000;
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public")));

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
    // Save the proof of ownership in the blockchain
    const tx = await ProofOfOwnership.saveProof(
      req.file.buffer,
      req.body.owner
    );
    const toWrite = {
      owner: req.body.owner,
      date: Date.now(),
      name: req.body.name
    };
    // Save it in the database
    await db.writeData("proof", toWrite, tx.ipfsHash);
    res.send(toWrite);
  } catch (e) {
    res
      .status(500) // HTTP status 404: NotFound
      .send("Not found");
  }
});

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

app.get("/load", async function(req, res) {
  const data = await db.readAll("proof");
  res.json({ res: data });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
