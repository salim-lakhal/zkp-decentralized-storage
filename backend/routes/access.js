const express = require("express");
const { MerkleTree, hashLeaf } = require("../utils/merkle");

const router = express.Router();

router.post("/merkle-root", (req, res, next) => {
  try {
    const { leaves } = req.body;
    if (!leaves || !Array.isArray(leaves) || leaves.length === 0) {
      return res.status(400).json({ error: "Non-empty leaves array is required" });
    }

    const tree = new MerkleTree(leaves);

    res.json({
      root: tree.getRoot(),
      leafCount: leaves.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/add-member", (req, res, next) => {
  try {
    const { leaves, newMember } = req.body;
    if (!leaves || !Array.isArray(leaves)) {
      return res.status(400).json({ error: "leaves array is required" });
    }
    if (!newMember) {
      return res.status(400).json({ error: "newMember is required" });
    }

    const updatedLeaves = [...leaves, newMember];
    const tree = new MerkleTree(updatedLeaves);

    res.json({
      root: tree.getRoot(),
      leafCount: updatedLeaves.length,
      newLeafHash: hashLeaf(newMember),
      newLeafIndex: updatedLeaves.length - 1,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
