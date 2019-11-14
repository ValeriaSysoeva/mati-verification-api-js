import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('src/example/.env')) {
  console.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: 'src/example/.env' });
} else {
  console.debug('Using .env.example file to supply config environment variables');
  dotenv.config({ path: 'src/example/.env.example' }); // you can delete this after you create your own .env file!
}
