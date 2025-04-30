import path from 'path';
import { readFile as nodeReadFile } from 'node:fs/promises';

import { writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'fs';

export async function readCodegenFile(filePath: string) {
  // Compose the absolute path to the file in the src directory
  const settingsPath = path.join(
    __dirname,
    '..',
    'src',
    ...filePath.split('/'),
  );
  const typesDir = path.dirname(settingsPath);

  if (existsSync(typesDir)) {
    mkdirSync(typesDir, { recursive: true });
  }

  try {
    // Try to read the existing file (if it exists)
    const result = await nodeReadFile(settingsPath, 'utf-8');
    return result.toString();
  } catch (error) {
    // If the file does not exist, log and proceed to create it
    console.error(`Could not read ${filePath}, creating new file`);
    // If the file does not exist, create an empty file first
    await writeFile(settingsPath, '', 'utf-8');
    return '';
  }
}

export async function writeCodegenContent({
  filePath,
  content,
}: {
  filePath: string;
  content: string;
}) {
  // Compose the absolute path to the file in the src directory
  const settingsPath = path.join(
    __dirname,
    '..',
    'src',
    ...filePath.split('/'),
  );
  const typesDir = path.dirname(settingsPath);

  if (existsSync(typesDir)) {
    mkdirSync(typesDir, { recursive: true });
  }

  try {
    // Try to read the existing file (if it exists)
    await nodeReadFile(settingsPath, 'utf-8');
  } catch (error) {
    // If the file does not exist, log and proceed to create it
    console.error(`Could not read ${filePath}, creating new file`);
    // If the file does not exist, create an empty file first
    await writeFile(settingsPath, '', 'utf-8');
  }

  try {
    // Write the new content to the file (overwrite or create)
    await writeFile(settingsPath, content, 'utf-8');
    console.log(`Successfully wrote to ${filePath}`);
  } catch (error) {
    console.error(`Failed to write to ${filePath}:`, error);
    throw error;
  }
}
