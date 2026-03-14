const express = require("express");
const snarkjs = require("snarkjs");
const { MerkleTree } = require("../utils/merkle");

const router = express.Router();

router.post("/generate", async (req, res, next) => {
  try {
    const { leaf, leaves } = req.body;
    if (!leaf || !leaves || !Array.isArray(leaves)) {
      return res.status(400).json({ error: "leaf and leaves array are required" });
    }

    const tree = new MerkleTree(leaves);
    const leafIndex = leaves.indexOf(leaf);

    if (leafIndex === -1) {
      return res.status(400).json({ error: "Leaf not found in tree" });
    }

    const proof = tree.getProof(leafIndex);
    const root = tree.getRoot();

    const pathElements = proof.map((p) => p.hash);
    const pathIndices = proof.map((p) => (p.position === "right" ? 0 : 1));

    res.json({
      root,
      pathElements,
      pathIndices,
      leaf: tree.leaves[leafIndex],
      leafIndex,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { proof, publicSignals } = req.body;
    if (!proof || !publicSignals) {
      return res.status(400).json({ error: "proof and publicSignals are required" });
    }

    const vkeyPath = process.env.VERIFICATION_KEY_PATH;
    if (!vkeyPath) {
      return res.status(500).json({ error: "Verification key not configured" });
    }

    const vkey = require(vkeyPath);
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    res.json({ valid });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
