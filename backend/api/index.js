// Vercel treats an exported Express app as a request handler.
// vercel.json rewrites every request to this function.
module.exports = require("../app");
