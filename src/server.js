require("dotenv").config();
const Hashing = require("./lib/hashing.js");
const ProofOfOwnership = require("./lib/proofOfOwnership");
const Database = require("./lib/database.js");
const express = require("express");

// Initialize express config
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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
 *  doc: string
 *  owner: string
 * }
 */
app.post("/", async function(req, res) {
  // Hash the document
  const hash = Hashing.getHash(req.body.doc);

  try {
    // Save the proof of ownership in the blockchain
    const tx = await ProofOfOwnership.saveProof(hash, req.body.owner);
    const toWrite = {
      hash: hash,
      owner: req.body.owner,
      date: Date.now(),
      txHash: tx.hash
    };
    // Save it in the database
    await db.writeData("proof", toWrite, hash);
    res.send(toWrite);
  } catch (e) {
    res.send(e.message);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
