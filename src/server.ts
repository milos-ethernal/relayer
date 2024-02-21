import { CreateTx, SignTransaction } from "./app";
import { SubmitTransaction } from "./ogmios";

require('dotenv').config();
const express = require('express');
const app = express();
let PORT = process.env.PORT;
if (!PORT) {
    PORT = "8000";
}

// Middleware to parse JSON requests
app.use(express.json());

// Define a route for GET requests
app.post('/api/createAndSignBridgingTx', async (req, res) => {
    // Validate request body fields
    const { priv_key, sender_address, recv_address, amount, chainId } = req.body;
    if (!priv_key || !sender_address || !recv_address || !amount || !chainId) {
        res.status(400).json({ error: 'Missing required fields in request body' });
        return;
    }

    // Validate originChain value
    const originChain = chainId.toLowerCase();
    if (originChain !== 'prime' && originChain !== 'vector') {
        res.status(400).json({ error: 'Invalid chainId value' });
        return;
    }

    // Determine destinationChain based on originChain
    const destinationChain = originChain === 'prime' ? 'vector' : 'prime';

    // Call CreateTx, SignTransaction, and SubmitTransaction functions
    try {
        const unsignedTx = await CreateTx(originChain, sender_address, recv_address, amount, destinationChain);
        if (!unsignedTx) {
            res.status(500).json({ error: 'Error while creating transaction' });
            return;
        }
        const signedTx = await SignTransaction(priv_key, unsignedTx);
        const submitResult = await SubmitTransaction(originChain, signedTx);
        res.json({ message: submitResult });
    } catch (error) {
        console.error('Error while processing transaction:', error);
        res.status(500).json({ error: 'Error while processing transaction' });
    }
});

// Define a route for POST requests
app.post('/api/createAndSignBatchingTx', async (req, res) => {
    // Validate request body fields
    const { chainId, recv_addr, amount } = req.body;
    if (!chainId || !recv_addr || !amount) {
        res.status(400).json({ error: 'Missing required fields in request body' });
        return;
    }

    // Validate originChain value
    const originChain = chainId.toLowerCase();
    if (originChain !== 'prime' && originChain !== 'vector') {
        res.status(400).json({ error: 'Invalid chainId value' });
        return;
    }

    const senderAddress = chainId === "prime" ? process.env.MULTISIG_ADDRESS_PRIME : process.env.MULTISIG_ADDRESS_VECTOR
    const privKey = chainId === "prime" ? process.env.MULTISIG_PK_PRIME : process.env.MULTISIG_PK_VECTOR
    // Check if senderAddress and privKey are set in environment variables
    if (!senderAddress || !privKey) {
        res.status(500).json({ error: 'Multisig address or private key not set in environment variables' });
        return;
    }


    // Call CreateTx, SignTransaction, and SubmitTransaction functions
    try {
        const unsignedTx = await CreateTx(originChain, senderAddress, recv_addr, amount, undefined);
        if (!unsignedTx) {
            res.status(500).json({ error: 'Error while creating transaction' });
            return;
        }
        const signedTx = await SignTransaction(privKey, unsignedTx);
        const submitResult = await SubmitTransaction(originChain, signedTx);
        res.json({ message: submitResult });
    } catch (error) {
        console.error('Error while processing transaction:', error);
        res.status(500).json({ error: 'Error while processing transaction' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});