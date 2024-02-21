"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.GetMultisigAddress = exports.GetUtxos = exports.GetTransactionBuilder = void 0;
var cardano_serialization_lib_nodejs_1 = require("@emurgo/cardano-serialization-lib-nodejs");
var ogmios_1 = require("./ogmios");
function GetTransactionBuilder(chainId) {
    return __awaiter(this, void 0, void 0, function () {
        var protocolParams, linearFee, max_value_size, max_tx_size, cfg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, ogmios_1.GetProtocolParameters)(chainId)];
                case 1:
                    protocolParams = _a.sent();
                    linearFee = cardano_serialization_lib_nodejs_1.LinearFee["new"](cardano_serialization_lib_nodejs_1.BigNum.from_str(protocolParams.minFeeCoefficient.toString()), cardano_serialization_lib_nodejs_1.BigNum.from_str(protocolParams.minFeeConstant.ada.lovelace.toString()));
                    if (protocolParams.maxValueSize === undefined || protocolParams.maxTransactionSize === undefined) {
                        console.error("handle");
                    }
                    max_value_size = protocolParams.maxValueSize !== undefined ? protocolParams.maxValueSize.bytes : 0;
                    max_tx_size = protocolParams.maxTransactionSize !== undefined ? protocolParams.maxTransactionSize.bytes : 0;
                    cfg = cardano_serialization_lib_nodejs_1.TransactionBuilderConfigBuilder["new"]()
                        .fee_algo(linearFee)
                        .pool_deposit(cardano_serialization_lib_nodejs_1.BigNum.from_str(protocolParams.stakePoolDeposit.ada.lovelace.toString()))
                        .key_deposit(cardano_serialization_lib_nodejs_1.BigNum.from_str(protocolParams.stakeCredentialDeposit.ada.lovelace.toString()))
                        .max_value_size(max_value_size)
                        .max_tx_size(max_tx_size)
                        .coins_per_utxo_byte(cardano_serialization_lib_nodejs_1.BigNum.from_str(protocolParams.minUtxoDepositCoefficient.toString()))
                        .build();
                    return [2 /*return*/, cardano_serialization_lib_nodejs_1.TransactionBuilder["new"](cfg)];
            }
        });
    });
}
exports.GetTransactionBuilder = GetTransactionBuilder;
function GetUtxos(chainId, address, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var utxos, potentialFee, minUtxoValue, retVal, token_amount, amount_sum, index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, ogmios_1.GetUTXOsFromAddress)(chainId, address)];
                case 1:
                    utxos = _a.sent();
                    potentialFee = process.env.POTENTIAL_FEE ? parseInt(process.env.POTENTIAL_FEE, 10) : 0;
                    minUtxoValue = 1000000;
                    retVal = [];
                    amount_sum = 0;
                    for (index = 0; index < utxos.length; index++) {
                        token_amount = parseInt(utxos[index].value.ada.lovelace.toString(), 10);
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
                        console.error("no enough avaialble funds for generating transaction " + amount_sum + " available but " + amount + potentialFee + minUtxoValue + " needed.");
                    }
                    return [2 /*return*/, retVal];
            }
        });
    });
}
exports.GetUtxos = GetUtxos;
function GetMultisigAddress(chainId) {
    var address;
    if (chainId == "prime") {
        address = process.env.MULTISIG_ADDRESS_PRIME ? process.env.MULTISIG_ADDRESS_PRIME : "";
    }
    else {
        address = process.env.MULTISIG_ADDRESS_VECTOR ? process.env.MULTISIG_ADDRESS_VECTOR : "";
    }
    return cardano_serialization_lib_nodejs_1.Address.from_bech32(address);
}
exports.GetMultisigAddress = GetMultisigAddress;
