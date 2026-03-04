import {
    Address,
    beginCell,
    Cell,
    Contract,
    ContractABI,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode
} from '@ton/core';

export type ChallengeChildConfig = {};

export function challengeChildConfigToCell(config: ChallengeChildConfig): Cell {
    return beginCell().endCell();
}

export class ChallengeChild implements Contract {
    abi: ContractABI = { name: 'ChallengeChild' };

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new ChallengeChild(address);
    }

    static createFromConfig(config: ChallengeChildConfig, code: Cell, workchain = 0) {
        const data = challengeChildConfigToCell(config);
        const init = { code, data };
        return new ChallengeChild(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
