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
exports.BridgeToPrime = exports.BridgeToVector = exports.testerBatchingToPrime = exports.testerBridgingToPrime = exports.testerBatchingToVector = exports.testerBridgingToVector = exports.SignTransaction = exports.CreateTx = void 0;
var ogmios_1 = require("./ogmios");
var helper_1 = require("./helper");
var cardano_serialization_lib_nodejs_1 = require("@emurgo/cardano-serialization-lib-nodejs");
function CreateTx(originChain, address, receiver, amount, destinationChain) {
    return __awaiter(this, void 0, void 0, function () {
        var tx_builder, senderAddress, enterpriseAddress, pubKeyHash, utxos, auxiliary_data, gtm, map, map_t1, list, gtm, map, receiverAddress, receiverAddress, slot, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, helper_1.GetTransactionBuilder)(originChain)];
                case 1:
                    tx_builder = _b.sent();
                    senderAddress = cardano_serialization_lib_nodejs_1.Address.from_bech32(address);
                    enterpriseAddress = cardano_serialization_lib_nodejs_1.EnterpriseAddress.from_address(senderAddress);
                    if (!enterpriseAddress) {
                        console.error("error while creating sender enterprise address");
                        return [2 /*return*/];
                    }
                    pubKeyHash = enterpriseAddress.payment_cred().to_keyhash();
                    if (!pubKeyHash) {
                        console.error("error while creating sender pub key hash");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, helper_1.GetUtxos)(originChain, address, amount)];
                case 2:
                    utxos = _b.sent();
                    utxos.forEach(function (utxo) {
                        tx_builder.add_key_input(pubKeyHash, cardano_serialization_lib_nodejs_1.TransactionInput["new"](cardano_serialization_lib_nodejs_1.TransactionHash.from_hex(utxo.transaction.id), utxo.index), cardano_serialization_lib_nodejs_1.Value["new"](cardano_serialization_lib_nodejs_1.BigNum.from_str(utxo.value.ada.lovelace.toString())));
                    });
                    auxiliary_data = cardano_serialization_lib_nodejs_1.AuxiliaryData["new"]();
                    // Add metadata
                    if (destinationChain) {
                        gtm = cardano_serialization_lib_nodejs_1.GeneralTransactionMetadata["new"]();
                        map = cardano_serialization_lib_nodejs_1.MetadataMap["new"]();
                        map.insert_str("chainId", cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_text(destinationChain));
                        map_t1 = cardano_serialization_lib_nodejs_1.MetadataMap["new"]();
                        map_t1.insert_str("address", cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_text(receiver));
                        map_t1.insert_str("amount", cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_int(cardano_serialization_lib_nodejs_1.Int.from_str(amount.toString())));
                        list = cardano_serialization_lib_nodejs_1.MetadataList["new"]();
                        list.add(cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_map(map_t1));
                        map.insert(cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_text("transactions"), cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_list(list));
                        gtm.insert(cardano_serialization_lib_nodejs_1.BigNum.one(), cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_map(map));
                        auxiliary_data.set_metadata(gtm);
                        tx_builder.set_auxiliary_data(auxiliary_data);
                    }
                    else {
                        gtm = cardano_serialization_lib_nodejs_1.GeneralTransactionMetadata["new"]();
                        map = cardano_serialization_lib_nodejs_1.MetadataMap["new"]();
                        map.insert_str("batch_nonce_id", cardano_serialization_lib_nodejs_1.TransactionMetadatum.new_int(cardano_serialization_lib_nodejs_1.Int.from_str(amount.toString())));
                        auxiliary_data.set_metadata(gtm);
                        tx_builder.set_auxiliary_data(auxiliary_data);
                    }
                    // Add outputs
                    if (destinationChain) {
                        receiverAddress = (0, helper_1.GetMultisigAddress)(originChain);
                        tx_builder.add_output(cardano_serialization_lib_nodejs_1.TransactionOutput["new"](receiverAddress, cardano_serialization_lib_nodejs_1.Value["new"](cardano_serialization_lib_nodejs_1.BigNum.from_str(amount.toString()))));
                    }
                    else {
                        receiverAddress = cardano_serialization_lib_nodejs_1.Address.from_bech32(receiver);
                        tx_builder.add_output(cardano_serialization_lib_nodejs_1.TransactionOutput["new"](receiverAddress, cardano_serialization_lib_nodejs_1.Value["new"](cardano_serialization_lib_nodejs_1.BigNum.from_str(amount.toString()))));
                    }
                    _a = parseInt;
                    return [4 /*yield*/, (0, ogmios_1.GetSlot)(originChain)];
                case 3:
                    slot = _a.apply(void 0, [_b.sent(), 10]) + 300;
                    tx_builder.set_ttl_bignum(cardano_serialization_lib_nodejs_1.BigNum.from_str(slot.toString()));
                    tx_builder.add_change_if_needed(senderAddress);
                    return [2 /*return*/, cardano_serialization_lib_nodejs_1.Transaction["new"](tx_builder.build(), cardano_serialization_lib_nodejs_1.TransactionWitnessSet["new"](), auxiliary_data)];
            }
        });
    });
}
exports.CreateTx = CreateTx;
function SignTransaction(bech32PkString, tx) {
    return __awaiter(this, void 0, void 0, function () {
        var privKey, txBody, txBodyHash, vkey_witnesses, vkey_witness, witness;
        return __generator(this, function (_a) {
            privKey = cardano_serialization_lib_nodejs_1.PrivateKey.from_bech32(bech32PkString);
            txBody = tx.body();
            txBodyHash = (0, cardano_serialization_lib_nodejs_1.hash_transaction)(txBody);
            vkey_witnesses = cardano_serialization_lib_nodejs_1.Vkeywitnesses["new"]();
            vkey_witness = (0, cardano_serialization_lib_nodejs_1.make_vkey_witness)(txBodyHash, privKey);
            vkey_witnesses.add(vkey_witness);
            witness = cardano_serialization_lib_nodejs_1.TransactionWitnessSet["new"]();
            witness.set_vkeys(vkey_witnesses);
            return [2 /*return*/, cardano_serialization_lib_nodejs_1.Transaction["new"](txBody, witness, tx.auxiliary_data())];
        });
    });
}
exports.SignTransaction = SignTransaction;
function testerBridgingToVector() {
    return __awaiter(this, void 0, void 0, function () {
        var originChain, destinationChain, myAddress, myPkString, receiverAddress, receiverAmount, unsignedTx, signedTx, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originChain = "prime";
                    destinationChain = "vector";
                    myAddress = process.env.USER_ADDRESS_PRIME;
                    if (!myAddress) {
                        console.error("Sender not defined in .env");
                        return [2 /*return*/];
                    }
                    myPkString = process.env.USER_PK_PRIME;
                    if (!myPkString) {
                        console.error("Private key not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAddress = process.env.USER_ADDRESS_VECTOR;
                    if (!receiverAddress) {
                        console.error("Receiver address not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAmount = 1000000;
                    return [4 /*yield*/, CreateTx(originChain, myAddress, receiverAddress, receiverAmount, destinationChain)];
                case 1:
                    unsignedTx = _a.sent();
                    if (!unsignedTx) {
                        console.error("Error while creating transaction");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, SignTransaction(myPkString, unsignedTx)
                        // Submit
                    ];
                case 2:
                    signedTx = _a.sent();
                    return [4 /*yield*/, (0, ogmios_1.SubmitTransaction)(originChain, signedTx)];
                case 3:
                    res = _a.sent();
                    console.log("Bridging transaction sent to PRIME: " + res);
                    return [2 /*return*/];
            }
        });
    });
}
exports.testerBridgingToVector = testerBridgingToVector;
function testerBatchingToVector() {
    return __awaiter(this, void 0, void 0, function () {
        var originChain, myAddress, myPkString, receiverAddress, receiverAmount, unsignedTx, signedTx, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originChain = "vector";
                    myAddress = process.env.MULTISIG_ADDRESS_VECTOR;
                    if (!myAddress) {
                        console.error("Sender not defined in .env");
                        return [2 /*return*/];
                    }
                    myPkString = process.env.MULTISIG_PK_VECTOR;
                    if (!myPkString) {
                        console.error("Private key not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAddress = process.env.USER_ADDRESS_VECTOR;
                    if (!receiverAddress) {
                        console.error("Receiver address not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAmount = 1000000;
                    return [4 /*yield*/, CreateTx(originChain, myAddress, receiverAddress, receiverAmount, undefined)];
                case 1:
                    unsignedTx = _a.sent();
                    if (!unsignedTx) {
                        console.error("Error while creating transaction");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, SignTransaction(myPkString, unsignedTx)
                        // Submit
                    ];
                case 2:
                    signedTx = _a.sent();
                    return [4 /*yield*/, (0, ogmios_1.SubmitTransaction)(originChain, signedTx)];
                case 3:
                    res = _a.sent();
                    console.log("Batching transaction sent to VECTOR: " + res);
                    return [2 /*return*/];
            }
        });
    });
}
exports.testerBatchingToVector = testerBatchingToVector;
function testerBridgingToPrime() {
    return __awaiter(this, void 0, void 0, function () {
        var originChain, destinationChain, myAddress, myPkString, receiverAddress, receiverAmount, unsignedTx, signedTx, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originChain = "vector";
                    destinationChain = "prime";
                    myAddress = process.env.USER_ADDRESS_VECTOR;
                    if (!myAddress) {
                        console.error("Sender not defined in .env");
                        return [2 /*return*/];
                    }
                    myPkString = process.env.USER_PK_VECTOR;
                    if (!myPkString) {
                        console.error("Private key not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAddress = process.env.USER_ADDRESS_PRIME;
                    if (!receiverAddress) {
                        console.error("Receiver address not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAmount = 1000000;
                    return [4 /*yield*/, CreateTx(originChain, myAddress, receiverAddress, receiverAmount, destinationChain)];
                case 1:
                    unsignedTx = _a.sent();
                    if (!unsignedTx) {
                        console.error("Error while creating transaction");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, SignTransaction(myPkString, unsignedTx)
                        // Submit
                    ];
                case 2:
                    signedTx = _a.sent();
                    return [4 /*yield*/, (0, ogmios_1.SubmitTransaction)(originChain, signedTx)];
                case 3:
                    res = _a.sent();
                    console.log("Bridging transaction sent to VECTOR: " + res);
                    return [2 /*return*/];
            }
        });
    });
}
exports.testerBridgingToPrime = testerBridgingToPrime;
function testerBatchingToPrime() {
    return __awaiter(this, void 0, void 0, function () {
        var originChain, myAddress, myPkString, receiverAddress, receiverAmount, unsignedTx, signedTx, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originChain = "prime";
                    myAddress = process.env.MULTISIG_ADDRESS_PRIME;
                    if (!myAddress) {
                        console.error("Sender not defined in .env");
                        return [2 /*return*/];
                    }
                    myPkString = process.env.MULTISIG_PK_PRIME;
                    if (!myPkString) {
                        console.error("Private key not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAddress = process.env.USER_ADDRESS_PRIME;
                    if (!receiverAddress) {
                        console.error("Receiver address not defined in .env");
                        return [2 /*return*/];
                    }
                    receiverAmount = 1000000;
                    return [4 /*yield*/, CreateTx(originChain, myAddress, receiverAddress, receiverAmount, undefined)];
                case 1:
                    unsignedTx = _a.sent();
                    if (!unsignedTx) {
                        console.error("Error while creating transaction");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, SignTransaction(myPkString, unsignedTx)
                        // Submit
                    ];
                case 2:
                    signedTx = _a.sent();
                    return [4 /*yield*/, (0, ogmios_1.SubmitTransaction)(originChain, signedTx)];
                case 3:
                    res = _a.sent();
                    console.log("Batching transaction sent to PRIME: " + res);
                    return [2 /*return*/];
            }
        });
    });
}
exports.testerBatchingToPrime = testerBatchingToPrime;
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function BridgeToVector() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testerBridgingToVector()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testerBatchingToVector()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.BridgeToVector = BridgeToVector;
function BridgeToPrime() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testerBridgingToPrime()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testerBatchingToPrime()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.BridgeToPrime = BridgeToPrime;
// runExample("", "")
function test() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    require('dotenv').config();
                    return [4 /*yield*/, BridgeToVector()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sleep(3000)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, BridgeToPrime()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
test();
