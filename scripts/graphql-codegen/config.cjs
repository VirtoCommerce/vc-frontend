const dotenv = require("dotenv");

// Read environment variables from both .env and .env.local
dotenv.config();
dotenv.config({ path: ".env.local", override: true });
