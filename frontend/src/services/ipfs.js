const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export async function fetchFileMetadata(cid) {
  const res = await fetch(`${API_URL}/api/files/${cid}`);
  if (!res.ok) throw new Error('Failed to fetch file metadata');
  return res.json();
}

export async function fetchUserFiles(address) {
  const res = await fetch(`${API_URL}/api/files?owner=${address}`);
  if (!res.ok) throw new Error('Failed to fetch user files');
  return res.json();
}

export async function deleteFile(cid) {
  const res = await fetch(`${API_URL}/api/files/${cid}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete file');
  return res.json();
}

export async function downloadFile(cid) {
  const res = await fetch(`${API_URL}/api/files/${cid}/download`);
  if (!res.ok) throw new Error('Failed to download file');
  return res.blob();
}
