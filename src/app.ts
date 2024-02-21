import { createLedgerStateQueryClient } from '@cardano-ogmios/client';
import { GetSlot, GetUTXOsFromAddress, SubmitTransaction, createContext } from './ogmios';
import { GetMultisigAddress, GetTransactionBuilder, GetUtxos } from './helper';
import { Address, AuxiliaryData, BaseAddress, BigNum, EnterpriseAddress, GeneralTransactionMetadata, Int, MetadataList, MetadataMap, PrivateKey, Transaction, TransactionHash, TransactionInput, TransactionMetadatum, TransactionOutput, TransactionWitnessSet, Value, Vkeywitnesses, hash_transaction, make_vkey_witness } from '@emurgo/cardano-serialization-lib-nodejs';


export async function CreateTx(originChain: string, address: string, receiver: string, amount: number, destinationChain?: string) {
    const tx_builder = await GetTransactionBuilder(originChain)

    const senderAddress = Address.from_bech32(address)
    // const baseAddress = BaseAddress.from_address(senderAddress);
    // if (!baseAddress) {
    //     console.error("error while creating sender base address")
    //     return;
    // }
    const enterpriseAddress = EnterpriseAddress.from_address(senderAddress);
    if (!enterpriseAddress) {
        console.error("error while creating sender enterprise address")
        return;
    }

    const pubKeyHash = enterpriseAddress.payment_cred().to_keyhash();
    if (!pubKeyHash) {
        console.error("error while creating sender pub key hash")
        return
    }

    // Add sender inputs
    const utxos = await GetUtxos(originChain, address, amount)

    utxos.forEach(utxo => {
        tx_builder.add_key_input(
            pubKeyHash,
            TransactionInput.new(
                TransactionHash.from_hex(utxo.transaction.id),
                utxo.index
            ),
            Value.new(BigNum.from_str(utxo.value.ada.lovelace.toString()))
        )
    });

    let auxiliary_data = AuxiliaryData.new();
    // Add metadata
    if (destinationChain) {
        let gtm = GeneralTransactionMetadata.new();
        let map = MetadataMap.new();
        map.insert_str("chainId", TransactionMetadatum.new_text(destinationChain))

        let map_t1 = MetadataMap.new();
        map_t1.insert_str("address", TransactionMetadatum.new_text(receiver))
        map_t1.insert_str("amount", TransactionMetadatum.new_int(Int.from_str(amount.toString())))

        let list = MetadataList.new();
        list.add(TransactionMetadatum.new_map(map_t1))

        map.insert(TransactionMetadatum.new_text("transactions"), TransactionMetadatum.new_list(list));

        gtm.insert(BigNum.one(), TransactionMetadatum.new_map(map))

        auxiliary_data.set_metadata(gtm);
        tx_builder.set_auxiliary_data(auxiliary_data)
    } else {
        let gtm = GeneralTransactionMetadata.new();
        let map = MetadataMap.new();
        map.insert_str("batch_nonce_id", TransactionMetadatum.new_int(Int.from_str(amount.toString())))
        auxiliary_data.set_metadata(gtm);
        tx_builder.set_auxiliary_data(auxiliary_data)
    }

    // Add outputs
    if (destinationChain) {
        const receiverAddress = GetMultisigAddress(originChain);
        tx_builder.add_output(TransactionOutput.new(receiverAddress, Value.new(BigNum.from_str(amount.toString()))))
    } else {
        const receiverAddress = Address.from_bech32(receiver)
        tx_builder.add_output(TransactionOutput.new(receiverAddress, Value.new(BigNum.from_str(amount.toString()))))
    }

    // Set TTL
    const slot = parseInt(await GetSlot(originChain), 10) + 300
    tx_builder.set_ttl_bignum(BigNum.from_str(slot.toString()))

    tx_builder.add_change_if_needed(senderAddress)

    return Transaction.new(
        tx_builder.build(),
        TransactionWitnessSet.new(),
        auxiliary_data
    )
}

export async function SignTransaction(bech32PkString: string, tx: Transaction) {
    const privKey = PrivateKey.from_bech32(bech32PkString);
    const txBody = tx.body();
    const txBodyHash = hash_transaction(txBody)

    let vkey_witnesses = Vkeywitnesses.new();
    const vkey_witness = make_vkey_witness(txBodyHash, privKey);
    vkey_witnesses.add(vkey_witness)

    let witness = TransactionWitnessSet.new()
    witness.set_vkeys(vkey_witnesses)

    return Transaction.new(txBody, witness, tx.auxiliary_data())
}

export async function testerBridgingToVector() {
    // Bridging on prime
    // Chain that we are on
    let originChain = "prime"
    // Chain that we want to bridge to
    const destinationChain = "vector"
    let myAddress = process.env.USER_ADDRESS_PRIME
    if (!myAddress) {
        console.error("Sender not defined in .env")
        return
    }

    let myPkString = process.env.USER_PK_PRIME
    if (!myPkString) {
        console.error("Private key not defined in .env")
        return
    }

    const receiverAddress = process.env.USER_ADDRESS_VECTOR
    if (!receiverAddress) {
        console.error("Receiver address not defined in .env")
        return
    }
    const receiverAmount = 1000000

    // Create unsigned tx
    let unsignedTx = await CreateTx(originChain, myAddress, receiverAddress, receiverAmount, destinationChain)
    if (!unsignedTx) {
        console.error("Error while creating transaction")
        return
    }
    // Sign unsigned tx
    let signedTx = await SignTransaction(myPkString, unsignedTx)

    // Submit
    let res = await SubmitTransaction(originChain, signedTx)

    console.log("Bridging transaction sent to PRIME: " + res)

}

export async function testerBatchingToVector() {
    // Batching on vector
    const originChain = "vector"
    const myAddress = process.env.MULTISIG_ADDRESS_VECTOR
    if (!myAddress) {
        console.error("Sender not defined in .env")
        return
    }

    const myPkString = process.env.MULTISIG_PK_VECTOR
    if (!myPkString) {
        console.error("Private key not defined in .env")
        return
    }

    const receiverAddress = process.env.USER_ADDRESS_VECTOR
    if (!receiverAddress) {
        console.error("Receiver address not defined in .env")
        return
    }
    const receiverAmount = 1000000

    // Create unsigned tx
    const unsignedTx = await CreateTx(originChain, myAddress, receiverAddress, receiverAmount, undefined)
    if (!unsignedTx) {
        console.error("Error while creating transaction")
        return
    }
    // Sign unsigned tx
    const signedTx = await SignTransaction(myPkString, unsignedTx)

    // Submit
    const res = await SubmitTransaction(originChain, signedTx)

    console.log("Batching transaction sent to VECTOR: " + res)
}

export async function testerBridgingToPrime() {
    // Bridging on vector
    // Chain that we are on
    let originChain = "vector"
    // Chain that we want to bridge to
    const destinationChain = "prime"
    let myAddress = process.env.USER_ADDRESS_VECTOR
    if (!myAddress) {
        console.error("Sender not defined in .env")
        return
    }

    let myPkString = process.env.USER_PK_VECTOR
    if (!myPkString) {
        console.error("Private key not defined in .env")
        return
    }

    const receiverAddress = process.env.USER_ADDRESS_PRIME
    if (!receiverAddress) {
        console.error("Receiver address not defined in .env")
        return
    }
    const receiverAmount = 1000000

    // Create unsigned tx
    let unsignedTx = await CreateTx(originChain, myAddress, receiverAddress, receiverAmount, destinationChain)
    if (!unsignedTx) {
        console.error("Error while creating transaction")
        return
    }
    // Sign unsigned tx
    let signedTx = await SignTransaction(myPkString, unsignedTx)

    // Submit
    let res = await SubmitTransaction(originChain, signedTx)

    console.log("Bridging transaction sent to VECTOR: " + res)
}

export async function testerBatchingToPrime() {
    // Batching on prime
    const originChain = "prime"
    const myAddress = process.env.MULTISIG_ADDRESS_PRIME
    if (!myAddress) {
        console.error("Sender not defined in .env")
        return
    }

    const myPkString = process.env.MULTISIG_PK_PRIME
    if (!myPkString) {
        console.error("Private key not defined in .env")
        return
    }

    const receiverAddress = process.env.USER_ADDRESS_PRIME
    if (!receiverAddress) {
        console.error("Receiver address not defined in .env")
        return
    }
    const receiverAmount = 1000000

    // Create unsigned tx
    const unsignedTx = await CreateTx(originChain, myAddress, receiverAddress, receiverAmount, undefined)
    if (!unsignedTx) {
        console.error("Error while creating transaction")
        return
    }
    // Sign unsigned tx
    const signedTx = await SignTransaction(myPkString, unsignedTx)

    // Submit
    const res = await SubmitTransaction(originChain, signedTx)

    console.log("Batching transaction sent to PRIME: " + res)
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function BridgeToVector() {
    await testerBridgingToVector()
    await testerBatchingToVector()
}

export async function BridgeToPrime() {
    await testerBridgingToPrime()
    await testerBatchingToPrime()
}

async function test() {
    require('dotenv').config();

    await BridgeToVector()
    await sleep(3000);
    await BridgeToPrime()
}

//test()