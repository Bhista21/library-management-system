const app = require("./app");
const { ensureSchema } = require("./database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await ensureSchema();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

startServer();
