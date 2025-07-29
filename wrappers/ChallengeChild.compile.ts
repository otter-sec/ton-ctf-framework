import { CompilerConfig } from '@ton/blueprint';
import { writeFile } from 'fs/promises';
import path from 'path';

export const compile: CompilerConfig = {
    lang: 'func',
    postCompileHook: async (code) => {
        const auto = path.join(__dirname, '..', 'contracts', 'imports');
        await writeFile(path.join(auto, 'challenge_child_code.fc'), `;; auto-generated from challenge_child.fc\ncell challenge_child_code() asm "B{${code.toBoc().toString('hex')}} B>boc PUSHREF";\n`);
    },
    targets: ['contracts/challenge_child.fc'],
};
