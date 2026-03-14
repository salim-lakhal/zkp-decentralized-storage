#!/bin/bash
set -euo pipefail

CIRCUIT_NAME="merkle_proof"
BUILD_DIR="build"
PTAU_SIZE=15  # 2^15 constraints, sufficient for depth-20 Poseidon Merkle proof

mkdir -p "$BUILD_DIR"

# Step 1: Compile the circom circuit to R1CS + WASM
echo "[1/7] Compiling circuit..."
circom "${CIRCUIT_NAME}.circom" \
    --r1cs \
    --wasm \
    --sym \
    -o "$BUILD_DIR"

echo "[1/7] Done. Constraint count:"
snarkjs r1cs info "$BUILD_DIR/${CIRCUIT_NAME}.r1cs"

# Step 2: Start powers of tau ceremony (BN128 curve)
echo "[2/7] Starting powers of tau ceremony..."
snarkjs powersoftau new bn128 "$PTAU_SIZE" \
    "$BUILD_DIR/pot_${PTAU_SIZE}_0000.ptau" -v

# Step 3: Contribute to the ceremony with random entropy
echo "[3/7] Contributing to ceremony..."
snarkjs powersoftau contribute \
    "$BUILD_DIR/pot_${PTAU_SIZE}_0000.ptau" \
    "$BUILD_DIR/pot_${PTAU_SIZE}_0001.ptau" \
    --name="First contribution" -v -e="$(head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n')"

# Step 4: Prepare phase 2 (circuit-specific setup)
echo "[4/7] Preparing phase 2..."
snarkjs powersoftau prepare phase2 \
    "$BUILD_DIR/pot_${PTAU_SIZE}_0001.ptau" \
    "$BUILD_DIR/pot_${PTAU_SIZE}_final.ptau" -v

# Step 5: Generate the proving key (zkey) with Groth16
echo "[5/7] Generating proving key..."
snarkjs groth16 setup \
    "$BUILD_DIR/${CIRCUIT_NAME}.r1cs" \
    "$BUILD_DIR/pot_${PTAU_SIZE}_final.ptau" \
    "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"

# Contribute to phase 2 ceremony
snarkjs zkey contribute \
    "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" \
    "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
    --name="Phase 2 contribution" -v -e="$(head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n')"

# Step 6: Export the verification key
echo "[6/7] Exporting verification key..."
snarkjs zkey export verificationkey \
    "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
    "$BUILD_DIR/verification_key.json"

# Step 7: Export Solidity verifier contract
echo "[7/7] Exporting Solidity verifier..."
snarkjs zkey export solidityverifier \
    "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
    "$BUILD_DIR/Verifier.sol"

echo ""
echo "Build complete. Outputs in ${BUILD_DIR}/:"
echo "  - ${CIRCUIT_NAME}_final.zkey  (proving key)"
echo "  - verification_key.json       (verification key)"
echo "  - Verifier.sol                (on-chain verifier)"
echo "  - ${CIRCUIT_NAME}_js/         (WASM prover)"
