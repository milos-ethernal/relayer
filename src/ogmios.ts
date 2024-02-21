import { createLedgerStateQueryClient, createTransactionSubmissionClient } from '@cardano-ogmios/client';
import { createInteractionContext } from '@cardano-ogmios/client'
import { protocolParameters } from '@cardano-ogmios/client/dist/LedgerStateQuery';
import { UtxoByAddresses } from '@cardano-ogmios/schema/dist'
import { Transaction } from '@emurgo/cardano-serialization-lib-nodejs';
import { error } from 'console';

export const createContext = (chainId: string) => {
    let host, port;

    // Set host and port based on chainId
    if (chainId === 'prime') {
        host = process.env.OGMIOS_NODE_ADDRESS_PRIME;
        port = process.env.OGMIOS_NODE_PORT_PRIME ? parseInt(process.env.OGMIOS_NODE_PORT_PRIME, 10) : undefined;
    } else if (chainId === 'vector') {
        host = process.env.OGMIOS_NODE_ADDRESS_VECTOR;
        port = process.env.OGMIOS_NODE_PORT_VECTOR ? parseInt(process.env.OGMIOS_NODE_PORT_VECTOR, 10) : undefined;
    } else {
        // Default values if chainId doesn't match any condition
        host = "localhost";
        port = 1337;
    }

    return createInteractionContext(
        err => console.error(err),
        () => console.log("Connection closed."),
        { connection: { host, port } }
    );
};

export async function GetSlot(chainId: string) {
    const context = await createContext(chainId);
    const client = await createLedgerStateQueryClient(context)

    const tip = await client.networkTip()
    const retVal = tip["slot"]

    client.shutdown()

    return retVal
}

export async function GetProtocolParameters(chainId: string) {
    const context = await createContext(chainId);
    const client = await createLedgerStateQueryClient(context)

    const protocolParameters = await client.protocolParameters()

    client.shutdown()

    return protocolParameters
}

export async function GetUTXOsFromAddress(chainId: string, address: string) {
    const context = await createContext(chainId);
    const client = await createLedgerStateQueryClient(context)

    const filter: UtxoByAddresses = {
        addresses: [address]
    }
    const utxos = await client.utxo(filter)

    client.shutdown()

    return utxos
}

export async function SubmitTransaction(chainId: string, transaction: Transaction) {
    const context = await createContext(chainId);
    const client = await createTransactionSubmissionClient(context)

    const res = await client.submitTransaction(transaction.to_hex())

    client.shutdown()

    return res
}