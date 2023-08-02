const dotenv = require("dotenv");

process.env.NODE_TLS_REJECT_UNAUTHORIZED="0"

dotenv.config();
dotenv.config({ path: ".env.local", override: true });
