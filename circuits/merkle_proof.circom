pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";

template MerkleProof(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input root;

    signal hashes[depth + 1];
    hashes[0] <== leaf;

    component hashers[depth];
    component mux_left[depth];
    component mux_right[depth];

    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        hashers[i] = Poseidon(2);

        // pathIndices[i] == 0 => leaf is on the left
        // pathIndices[i] == 1 => leaf is on the right
        hashers[i].inputs[0] <== hashes[i] + pathIndices[i] * (pathElements[i] - hashes[i]);
        hashers[i].inputs[1] <== pathElements[i] + pathIndices[i] * (hashes[i] - pathElements[i]);

        hashes[i + 1] <== hashers[i].out;
    }

    root === hashes[depth];
}

component main {public [root]} = MerkleProof(20);
