import { CompilerConfig } from '@ton/blueprint';
import { compile as compileFunc } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'func',
    preCompileHook: async () => {
        await compileFunc('ChallengeChild');
    },
    targets: ['contracts/challenge.fc'],
};
