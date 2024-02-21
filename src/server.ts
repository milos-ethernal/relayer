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
    const privKey = req.body["priv_key"];
    const senderAddress = req.body["sender_address"];
    const receiverAddress = req.body["recv_address"];
    const amount = req.body["amount"];
    const originChain = req.body["chainId"];
    let destinationChain = "";
    if (originChain == "prime")
        destinationChain = "vector";
    else
        destinationChain = "prime";

    const unsignedTx = await CreateTx(originChain, senderAddress, receiverAddress, amount, destinationChain);
    if (!unsignedTx) {
        res.json({ message: 'Error while creating bridging transaction' });
        return;
    }

    const signedTx = await SignTransaction(privKey, unsignedTx)

    const submitResult = await SubmitTransaction(originChain, signedTx)

    res.json({ message: submitResult });
});

// Define a route for POST requests
app.post('/api/createAndSignBatchingTx', async (req, res) => {
    const originChain = req.body["chainId"];
    let senderAddress = originChain === "prime" ? process.env.MULTISIG_ADDRESS_PRIME : process.env.MULTISIG_ADDRESS_VECTOR
    if (!senderAddress) {
        res.json({ message: 'Error multisig address not set in env' });
        return;
    }

    const privKey = originChain === "prime" ? process.env.MULTISIG_PK_PRIME : process.env.MULTISIG_PK_VECTOR
    if (!privKey) {
        res.json({ message: 'Error multisig pk not set in env' });
        return;
    }
    const receiverAddress = req.body["recv_addr"];
    const amount = req.body["amount"];

    const unsignedTx = await CreateTx(originChain, senderAddress, receiverAddress, amount, undefined);
    if (!unsignedTx) {
        res.json({ message: 'Error while creating bridging transaction' });
        return;
    }

    const signedTx = await SignTransaction(privKey, unsignedTx)

    const submitResult = await SubmitTransaction(originChain, signedTx)

    res.json({ message: submitResult });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});