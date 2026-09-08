import {seedDemo} from '../src/demo-api.js';
import {writeFile,mkdir} from 'node:fs/promises';
const target=new URL('../../../src/Tga.Infrastructure/Persistence/Seeds/',import.meta.url);
await mkdir(target,{recursive:true});
await writeFile(new URL('demo.json',target),JSON.stringify(seedDemo('2026-09-08T12:00:00.000Z'),null,2)+'\n');
