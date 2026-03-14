require("dotenv").config();

const express = require("express");
const cors = require("cors");

const filesRouter = require("./routes/files");
const proofRouter = require("./routes/proof");
const accessRouter = require("./routes/access");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/api/files", filesRouter);
app.use("/api/proof", proofRouter);
app.use("/api/access", accessRouter);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
