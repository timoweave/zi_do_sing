import { describe, it, expect } from 'vitest';
// import * as fs from 'node:fs/promises';
// import * as path from 'node:path';

describe('Text File String Comparison Test', () => {
    it('testing', () => {
        expect(1).toEqual(1);
    });

    // it('should match the expected content from the txt file', async () => {
    //     // 1. Resolve the absolute path to the text file
    //     const filePath = path.resolve('__dirname', './data/sample.txt');
    //     // 2. Read the file contents as a UTF-8 string
    //     const fileContent = await fs.readFile(filePath, 'utf-8');
    //     // 3. Define the expected string
    //     const expectedString =
    //         'Hello, Vite and Vitest! Welcome to TypeScript testing.';
    //     // 4. Perform the string comparison
    //     expect(fileContent.trim()).toBe(expectedString);
    // });
    // it('should contain a specific substring', async () => {
    //     const filePath = path.resolve('__dirname', './data/sample.txt');
    //     const fileContent = await fs.readFile(filePath, 'utf-8');
    //     // Perform a partial string match
    //     expect(fileContent).toContain('Vite and Vitest');
    // });
});
