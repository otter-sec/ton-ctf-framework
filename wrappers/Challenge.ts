import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type ChallengeConfig = {};

export function challengeConfigToCell(config: ChallengeConfig): Cell {
    return beginCell().endCell();
}

export class Challenge implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Challenge(address);
    }

    static createFromConfig(config: ChallengeConfig, code: Cell, workchain = 0) {
        const data = challengeConfigToCell(config);
        const init = { code, data };
        return new Challenge(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
