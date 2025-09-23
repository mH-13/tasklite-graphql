import 'dotenv/config';

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  mongoDb: process.env.MONGO_DB || 'tasklite',
  jwtSecret: process.env.JWT_SECRET || 'devsecret'
};
