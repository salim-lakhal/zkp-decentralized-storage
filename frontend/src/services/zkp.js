const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function generateProof(fileId, userAddress) {
  const res = await fetch(`${API_URL}/api/zkp/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, userAddress }),
  });
  if (!res.ok) throw new Error('Failed to generate proof');
  return res.json();
}

export async function verifyProof(proof, publicSignals) {
  const res = await fetch(`${API_URL}/api/zkp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proof, publicSignals }),
  });
  if (!res.ok) throw new Error('Proof verification failed');
  return res.json();
}

export async function getProofStatus(proofId) {
  const res = await fetch(`${API_URL}/api/zkp/status/${proofId}`);
  if (!res.ok) throw new Error('Failed to fetch proof status');
  return res.json();
}
