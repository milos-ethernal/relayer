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
exports.SubmitTransaction = exports.GetUTXOsFromAddress = exports.GetProtocolParameters = exports.GetSlot = exports.createContext = void 0;
var client_1 = require("@cardano-ogmios/client");
var client_2 = require("@cardano-ogmios/client");
var createContext = function (chainId) {
    var host, port;
    // Set host and port based on chainId
    if (chainId === 'prime') {
        host = process.env.OGMIOS_NODE_ADDRESS_PRIME;
        port = process.env.OGMIOS_NODE_PORT_PRIME ? parseInt(process.env.OGMIOS_NODE_PORT_PRIME, 10) : undefined;
    }
    else if (chainId === 'vector') {
        host = process.env.OGMIOS_NODE_ADDRESS_VECTOR;
        port = process.env.OGMIOS_NODE_PORT_VECTOR ? parseInt(process.env.OGMIOS_NODE_PORT_VECTOR, 10) : undefined;
    }
    else {
        // Default values if chainId doesn't match any condition
        host = "localhost";
        port = 1337;
    }
    return (0, client_2.createInteractionContext)(function (err) { return console.error(err); }, function () { return console.log("Connection closed."); }, { connection: { host: host, port: port } });
};
exports.createContext = createContext;
function GetSlot(chainId) {
    return __awaiter(this, void 0, void 0, function () {
        var context, client, tip, retVal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.createContext)(chainId)];
                case 1:
                    context = _a.sent();
                    return [4 /*yield*/, (0, client_1.createLedgerStateQueryClient)(context)];
                case 2:
                    client = _a.sent();
                    return [4 /*yield*/, client.networkTip()];
                case 3:
                    tip = _a.sent();
                    retVal = tip["slot"];
                    client.shutdown();
                    return [2 /*return*/, retVal];
            }
        });
    });
}
exports.GetSlot = GetSlot;
function GetProtocolParameters(chainId) {
    return __awaiter(this, void 0, void 0, function () {
        var context, client, protocolParameters;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.createContext)(chainId)];
                case 1:
                    context = _a.sent();
                    return [4 /*yield*/, (0, client_1.createLedgerStateQueryClient)(context)];
                case 2:
                    client = _a.sent();
                    return [4 /*yield*/, client.protocolParameters()];
                case 3:
                    protocolParameters = _a.sent();
                    client.shutdown();
                    return [2 /*return*/, protocolParameters];
            }
        });
    });
}
exports.GetProtocolParameters = GetProtocolParameters;
function GetUTXOsFromAddress(chainId, address) {
    return __awaiter(this, void 0, void 0, function () {
        var context, client, filter, utxos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.createContext)(chainId)];
                case 1:
                    context = _a.sent();
                    return [4 /*yield*/, (0, client_1.createLedgerStateQueryClient)(context)];
                case 2:
                    client = _a.sent();
                    filter = {
                        addresses: [address]
                    };
                    return [4 /*yield*/, client.utxo(filter)];
                case 3:
                    utxos = _a.sent();
                    client.shutdown();
                    return [2 /*return*/, utxos];
            }
        });
    });
}
exports.GetUTXOsFromAddress = GetUTXOsFromAddress;
function SubmitTransaction(chainId, transaction) {
    return __awaiter(this, void 0, void 0, function () {
        var context, client, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.createContext)(chainId)];
                case 1:
                    context = _a.sent();
                    return [4 /*yield*/, (0, client_1.createTransactionSubmissionClient)(context)];
                case 2:
                    client = _a.sent();
                    return [4 /*yield*/, client.submitTransaction(transaction.to_hex())];
                case 3:
                    res = _a.sent();
                    client.shutdown();
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.SubmitTransaction = SubmitTransaction;
