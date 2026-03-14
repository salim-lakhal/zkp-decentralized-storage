const { keccak256, toBeHex, zeroPadValue } = require("ethers");

function hashLeaf(value) {
  if (typeof value === "string" && value.startsWith("0x")) {
    return keccak256(value);
  }
  return keccak256(toBeHex(value, 32));
}

function hashPair(left, right) {
  const sorted = BigInt(left) < BigInt(right) ? [left, right] : [right, left];
  return keccak256(
    "0x" + sorted.map((h) => h.slice(2)).join("")
  );
}

class MerkleTree {
  constructor(leaves) {
    if (!leaves || leaves.length === 0) {
      throw new Error("Cannot create tree with no leaves");
    }
    this.leaves = leaves.map((l) => hashLeaf(l));
    this.layers = this._buildTree();
  }

  _buildTree() {
    const layers = [this.leaves.slice()];
    let current = this.leaves.slice();

    while (current.length > 1) {
      const next = [];
      for (let i = 0; i < current.length; i += 2) {
        if (i + 1 < current.length) {
          next.push(hashPair(current[i], current[i + 1]));
        } else {
          next.push(current[i]);
        }
      }
      layers.push(next);
      current = next;
    }

    return layers;
  }

  getRoot() {
    const topLayer = this.layers[this.layers.length - 1];
    return topLayer[0];
  }

  getProof(leafIndex) {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error("Leaf index out of bounds");
    }

    const proof = [];
    let index = leafIndex;

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRight = index % 2 === 1;
      const siblingIndex = isRight ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push({
          hash: layer[siblingIndex],
          position: isRight ? "left" : "right",
        });
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  addLeaf(value) {
    this.leaves.push(hashLeaf(value));
    this.layers = this._buildTree();
    return this.getRoot();
  }
}

module.exports = { MerkleTree, hashLeaf, hashPair };
