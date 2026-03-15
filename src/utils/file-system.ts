import fs from 'fs';
import path from 'path';

export function ensureWorkspace(): void {
  const workspacePath = path.join(process.cwd(), '.yg', 'workspace');
  fs.mkdirSync(workspacePath, { recursive: true });
}

export function saveToFile(filePath: string, content: string): string {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const dir = path.dirname(absolutePath);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(absolutePath, content, 'utf-8');
  return absolutePath;
}
