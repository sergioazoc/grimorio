import { glob as tinyGlob } from "tinyglobby";

export async function findComponentFiles(pattern: string): Promise<string[]> {
  return tinyGlob(pattern);
}
