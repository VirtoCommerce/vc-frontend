const dotenv = require("dotenv");

// Support self-signed certificate of platform app
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Read environment variables from both .env and .env.local
dotenv.config();
dotenv.config({ path: ".env.local", override: true });
