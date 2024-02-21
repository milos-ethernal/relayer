import { Address, BigNum, LinearFee, TransactionBuilder, TransactionBuilderConfigBuilder } from "@emurgo/cardano-serialization-lib-nodejs";
import { GetProtocolParameters, GetUTXOsFromAddress } from "./ogmios";
import { Utxo } from '@cardano-ogmios/schema/dist'

export async function GetTransactionBuilder(chainId: string) {
    const protocolParams = await GetProtocolParameters(chainId)

    let linearFee = LinearFee.new(BigNum.from_str(protocolParams.minFeeCoefficient.toString()), BigNum.from_str(protocolParams.minFeeConstant.ada.lovelace.toString()))

    if (!protocolParams.maxValueSize || !protocolParams.maxTransactionSize) {
        console.error("Error in maxValueSize = " + protocolParams.maxValueSize + ", maxTransactionSize = ", protocolParams.maxTransactionSize)
    }
    let max_value_size = protocolParams.maxValueSize !== undefined ? protocolParams.maxValueSize.bytes : 0;
    let max_tx_size = protocolParams.maxTransactionSize !== undefined ? protocolParams.maxTransactionSize.bytes : 0;


    let cfg = TransactionBuilderConfigBuilder.new()
        .fee_algo(linearFee)
        .pool_deposit(BigNum.from_str(protocolParams.stakePoolDeposit.ada.lovelace.toString()))
        .key_deposit(BigNum.from_str(protocolParams.stakeCredentialDeposit.ada.lovelace.toString()))
        .max_value_size(max_value_size)
        .max_tx_size(max_tx_size)
        .coins_per_utxo_byte(BigNum.from_str(protocolParams.minUtxoDepositCoefficient.toString()))
        .build()

    return TransactionBuilder.new(cfg)
}

export async function GetUtxos(chainId: string, address: string, amount: number) {

    const utxos = await GetUTXOsFromAddress(chainId, address)

    const potentialFee = process.env.POTENTIAL_FEE ? parseInt(process.env.POTENTIAL_FEE, 10) : 0;
    const minUtxoValue = 1000000

    let retVal: Utxo = []
    let token_amount: number;
    let amount_sum: number = 0;

    for (let index = 0; index < utxos.length; index++) {
        token_amount = parseInt(utxos[index].value.ada.lovelace.toString(), 10)
        if (token_amount >= amount + potentialFee + minUtxoValue) {
            amount_sum = token_amount;
            retVal = [utxos[index]];
            break;
        }

        amount_sum += token_amount;
        retVal.push(utxos[index]);

        if (amount_sum >= amount + potentialFee + minUtxoValue)
            break;
    }

    if (amount_sum < amount + potentialFee + minUtxoValue) {
        console.error("no enough avaialble funds for generating transaction " + amount_sum + " available but " + (amount + potentialFee + minUtxoValue) + " needed.")
    }

    return retVal
}

export function GetMultisigAddress(chainId: string) {
    let address: string;
    if (chainId == "prime") {
        address = process.env.MULTISIG_ADDRESS_PRIME ? process.env.MULTISIG_ADDRESS_PRIME : "";
    } else {
        address = process.env.MULTISIG_ADDRESS_VECTOR ? process.env.MULTISIG_ADDRESS_VECTOR : "";
    }

    return Address.from_bech32(address)
}