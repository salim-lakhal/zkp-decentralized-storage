# Merkle Proof Circuit (ZKP Access Control)

Zero-knowledge proof circuit for anonymous authorization. A user proves membership in a Merkle tree of authorized users without revealing which leaf (identity) they hold.

## What the Circuit Proves

Given a public Merkle root, the prover demonstrates knowledge of:
- A leaf value (their identity commitment)
- A valid Merkle path (sibling hashes + left/right indices)

that hashes up to the published root using Poseidon. The verifier learns nothing about which leaf was used.

Tree depth is 20, supporting up to ~1M authorized users.

## Prerequisites

- [circom](https://docs.circom.io/getting-started/installation/) >= 2.0
- [snarkjs](https://github.com/iden3/snarkjs) (`npm install -g snarkjs`)
- circomlib (`npm install` in the project root, or `npm install circomlib` in this directory)

## Build

```bash
chmod +x build_circuit.sh
./build_circuit.sh
```

Outputs are written to `build/`:
- `merkle_proof_final.zkey` -- proving key
- `verification_key.json` -- verification key (used off-chain or embedded in contract)
- `Verifier.sol` -- Groth16 verifier contract, deploy on-chain
- `merkle_proof_js/` -- WASM witness generator for client-side proving

## Generating a Proof

```bash
# Create input.json with your leaf, pathElements, pathIndices, and root
snarkjs groth16 fullprove input.json \
    build/merkle_proof_js/merkle_proof.wasm \
    build/merkle_proof_final.zkey \
    proof.json public.json

# Verify locally
snarkjs groth16 verify build/verification_key.json public.json proof.json
```

## Security Considerations

- **Trusted setup**: The powers of tau ceremony in `build_circuit.sh` uses a single contribution. For production, use a community ceremony (e.g., Hermez or Perpetual Powers of Tau) or run multiple independent contributions.
- **Leaf preimage**: Leaves should be Poseidon hashes of secrets (e.g., `Poseidon(secret, nonce)`), not raw values. If leaves are predictable, an attacker can brute-force membership.
- **Nullifiers**: This circuit proves membership but does not prevent double-use. Add a nullifier signal if you need to prevent replay (e.g., one access per user per epoch).
- **Root freshness**: The on-chain verifier should check that the submitted root matches the current authorized-users tree. Stale roots allow revoked users to generate valid proofs.
- **Curve**: Uses BN128 (alt-bn128), which has native precompile support on Ethereum for cheap on-chain verification.
