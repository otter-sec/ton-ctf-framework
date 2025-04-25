import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, beginCell } from '@ton/core';
import { Challenge } from '../wrappers/Challenge';
import { Exploit } from '../wrappers/Exploit';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Challenge', () => {
    let code: Cell;
    let exploitCode: Cell;

    beforeAll(async () => {
        code = await compile('Challenge');
        exploitCode = await compile('Exploit');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let challenge: SandboxContract<Challenge>;
    let exploitDeployer: SandboxContract<TreasuryContract>;
    let exploit: SandboxContract<Exploit>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        challenge = blockchain.openContract(Challenge.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await challenge.sendDeploy(deployer.getSender(), toNano('1'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: challenge.address,
            deploy: true,
            success: true,
        });

        exploit = blockchain.openContract(Exploit.createFromConfig({challengeAddress: challenge.address}, exploitCode));

        exploitDeployer = await blockchain.treasury('exploitDeployer');

        const exploitDeployResult = await exploit.sendDeploy(exploitDeployer.getSender(), toNano('1'));

        expect(exploitDeployResult.transactions).toHaveTransaction({
            from: exploitDeployer.address,
            to: exploit.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and challenge are ready to use
    });

    it('should solve', async () => {
        const result = await exploitDeployer.send({
            to: exploit.address,
            value: toNano('1'),
            body: beginCell()
                .storeUint(1, 32) // exploit::op::run
            .endCell(),
        });
        
        // solved event is represented as a message from challenge to itself
        expect(result.transactions).toHaveTransaction({
            from: challenge.address,
            to: challenge.address,
            op: 1337,
            success: true,
        });
    });
});
