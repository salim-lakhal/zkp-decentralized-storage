import { Contract } from 'ethers';

const FILE_REGISTRY_ADDRESS = process.env.REACT_APP_FILE_REGISTRY_ADDRESS || '';
const ACCESS_NFT_ADDRESS = process.env.REACT_APP_ACCESS_NFT_ADDRESS || '';

const FILE_REGISTRY_ABI = [
  'function registerFile(string cid, string name, uint256 size) external returns (uint256)',
  'function getFile(uint256 fileId) external view returns (string cid, string name, uint256 size, address owner, uint256 timestamp)',
  'function getUserFiles(address user) external view returns (uint256[])',
  'function deleteFile(uint256 fileId) external',
  'function getFileCount() external view returns (uint256)',
  'event FileRegistered(uint256 indexed fileId, address indexed owner, string cid)',
  'event FileDeleted(uint256 indexed fileId, address indexed owner)',
];

const ACCESS_NFT_ABI = [
  'function grantAccess(uint256 fileId, address user) external returns (uint256)',
  'function revokeAccess(uint256 tokenId) external',
  'function hasAccess(uint256 fileId, address user) external view returns (bool)',
  'function getAccessList(uint256 fileId) external view returns (address[])',
  'function balanceOf(address owner) external view returns (uint256)',
  'event AccessGranted(uint256 indexed fileId, address indexed user, uint256 tokenId)',
  'event AccessRevoked(uint256 indexed fileId, address indexed user)',
];

export function getFileRegistryContract(signerOrProvider) {
  if (!FILE_REGISTRY_ADDRESS) {
    throw new Error('FileRegistry contract address not configured');
  }
  return new Contract(FILE_REGISTRY_ADDRESS, FILE_REGISTRY_ABI, signerOrProvider);
}

export function getAccessNFTContract(signerOrProvider) {
  if (!ACCESS_NFT_ADDRESS) {
    throw new Error('AccessNFT contract address not configured');
  }
  return new Contract(ACCESS_NFT_ADDRESS, ACCESS_NFT_ABI, signerOrProvider);
}

export async function registerFile(signer, cid, name, size) {
  const contract = getFileRegistryContract(signer);
  const tx = await contract.registerFile(cid, name, size);
  return tx.wait();
}

export async function getUserFiles(provider, address) {
  const contract = getFileRegistryContract(provider);
  const fileIds = await contract.getUserFiles(address);
  const files = await Promise.all(
    fileIds.map(async (id) => {
      const [cid, name, size, owner, timestamp] = await contract.getFile(id);
      return { id: Number(id), cid, name, size: Number(size), owner, timestamp: Number(timestamp) };
    })
  );
  return files;
}

export async function deleteFileOnChain(signer, fileId) {
  const contract = getFileRegistryContract(signer);
  const tx = await contract.deleteFile(fileId);
  return tx.wait();
}

export async function grantAccess(signer, fileId, userAddress) {
  const contract = getAccessNFTContract(signer);
  const tx = await contract.grantAccess(fileId, userAddress);
  return tx.wait();
}

export async function revokeAccess(signer, tokenId) {
  const contract = getAccessNFTContract(signer);
  const tx = await contract.revokeAccess(tokenId);
  return tx.wait();
}

export async function getAccessList(provider, fileId) {
  const contract = getAccessNFTContract(provider);
  return contract.getAccessList(fileId);
}

export async function checkAccess(provider, fileId, userAddress) {
  const contract = getAccessNFTContract(provider);
  return contract.hasAccess(fileId, userAddress);
}
