import {Blockchain} from '@ton/sandbox';
import {beginCell, Cell, toNano} from '@ton/core';
import {Challenge} from '../wrappers/Challenge';
import {Exploit} from '../wrappers/Exploit';
import '@ton/test-utils';
import {compile} from '@ton/blueprint';
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {findTransaction} from "@ton/test-utils";

const FLAG = process.env.FLAG || 'ctf{test-flag}';

const app = express();
app.use(bodyParser.json());

let challengeCode: Cell;

compile('Challenge').then(code => {
    challengeCode = code;
});

app.post('/submit', async (req: Request, res: Response) => {
    try {
        const exploitCode = Cell.fromBase64(req.body.code);
        
        const blockchain = await Blockchain.create();
        
        // Deploy challenge contract
        const challenge = blockchain.openContract(Challenge.createFromConfig({}, challengeCode));
        const deployer = await blockchain.treasury('deployer');
        await challenge.sendDeploy(deployer.getSender(), toNano('1'));
        
        // Deploy exploit contract
        const exploit = blockchain.openContract(Exploit.createFromConfig({challengeAddress: challenge.address}, exploitCode));
        const exploitDeployer = await blockchain.treasury('exploitDeployer');
        await exploit.sendDeploy(exploitDeployer.getSender(), toNano('1'));
        
        // Call exploit with challenge address
        const result = await exploitDeployer.send({
            to: exploit.address,
            value: toNano('1'),
            body: beginCell()
                .storeUint(1, 32) // exploit::op::run
                .endCell(),
        });

        // Check if the exploit was successful by verifying if a solve event was emitted
        // solved event is represented as a message from challenge to itself
        const success = findTransaction(result.transactions, {
            from: challenge.address,
            to: challenge.address,
            op: 1337,
            success: true,
        }) !== undefined;
        let response: any = { success };
        if (success) {
            response.flag = FLAG;
        }
        
        res.json(response);
    } catch (error) {
        console.error('Error processing exploit:', error);
        res.status(500).json({ error: 'Failed to process exploit' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


