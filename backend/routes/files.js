const express = require("express");
const multer = require("multer");
const axios = require("axios");
const crypto = require("crypto");
const { encryptFile, deriveKey } = require("../utils/crypto");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    const { userAddress } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    if (!userAddress) return res.status(400).json({ error: "No user address provided" });

    const fileHash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const key = deriveKey(userAddress, fileHash);
    const { encrypted, iv, tag } = encryptFile(req.file.buffer, key);

    const formData = new FormData();
    const blob = new Blob([encrypted]);
    formData.append("file", blob, req.file.originalname);
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: req.file.originalname,
        keyvalues: { iv, tag, fileHash, uploader: userAddress.toLowerCase() },
      })
    );

    const pinataRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        maxBodyLength: Infinity,
      }
    );

    res.json({
      cid: pinataRes.data.IpfsHash,
      fileHash,
      iv,
      tag,
      size: pinataRes.data.PinSize,
      originalName: req.file.originalname,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;
    const gateway = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

    const response = await axios.get(`${gateway}/${cid}`, {
      responseType: "arraybuffer",
      headers: process.env.PINATA_GATEWAY_TOKEN
        ? { "x-pinata-gateway-token": process.env.PINATA_GATEWAY_TOKEN }
        : {},
    });

    res.set("Content-Type", "application/octet-stream");
    res.send(Buffer.from(response.data));
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "File not found" });
    }
    next(err);
  }
});

router.delete("/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;

    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    res.json({ unpinned: true, cid });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Pin not found" });
    }
    next(err);
  }
});

module.exports = router;
