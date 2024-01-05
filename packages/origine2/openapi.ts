/**
 * IMPORTANT: Start WebGAL Terre Sever before generating API!!!
 */

import axios from 'axios';
import {writeFileSync} from 'fs';
import { exec } from 'child_process'
import { env } from 'process';

let WEBGAL_PORT = 3000; // default port
if (env.WEBGAL_PORT) {
  WEBGAL_PORT = Number.parseInt(env.WEBGAL_PORT);
};

const SWAGGER_URL = `http://localhost:${WEBGAL_PORT + 1}/api-json`;
const SWAGGER_JSON_PATH = './src/config/swagger.json';
const API_OUTPUT_PATH = './src/api';

async function downloadSwaggerJson(): Promise<void> {
  try {
    const response = await axios.get(SWAGGER_URL);
    writeFileSync(SWAGGER_JSON_PATH, JSON.stringify(response.data, null, 2));
    console.log('Swagger JSON downloaded successfully.');
  } catch (error) {
    console.error('Error downloading Swagger JSON. Have you started the WebGAL Terre Sever?', error);
  }
}

function generateTypescriptApi(): void {
  exec(
    `swagger-typescript-api -p ${SWAGGER_JSON_PATH} -o ${API_OUTPUT_PATH} --axios`,
    (error, stdout, stderr) => {
      if (error) {
        console.error('Error generating TypeScript API:', error.message);
        return;
      }
      console.log('TypeScript API generated successfully.');
    }
  );
}

async function main(): Promise<void> {
  await downloadSwaggerJson();
  generateTypescriptApi();
}

main();
