// prisma.config.js
import 'dotenv/config'; // This loads your .env file
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Note: ensure these keys match exactly what's in your .env file
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
});