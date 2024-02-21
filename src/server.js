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
var app_1 = require("./app");
var ogmios_1 = require("./ogmios");
require('dotenv').config();
var express = require('express');
var app = express();
var PORT = process.env.PORT;
if (!PORT) {
    PORT = "8000";
}
// Middleware to parse JSON requests
app.use(express.json());
// Define a route for GET requests
app.post('/api/createAndSignBridgingTx', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, priv_key, sender_address, recv_address, amount, chainId, originChain, destinationChain, unsignedTx, signedTx, submitResult, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, priv_key = _a.priv_key, sender_address = _a.sender_address, recv_address = _a.recv_address, amount = _a.amount, chainId = _a.chainId;
                if (!priv_key || !sender_address || !recv_address || !amount || !chainId) {
                    res.status(400).json({ error: 'Missing required fields in request body' });
                    return [2 /*return*/];
                }
                originChain = chainId.toLowerCase();
                if (originChain !== 'prime' && originChain !== 'vector') {
                    res.status(400).json({ error: 'Invalid chainId value' });
                    return [2 /*return*/];
                }
                destinationChain = originChain === 'prime' ? 'vector' : 'prime';
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, (0, app_1.CreateTx)(originChain, sender_address, recv_address, amount, destinationChain)];
            case 2:
                unsignedTx = _b.sent();
                if (!unsignedTx) {
                    res.status(500).json({ error: 'Error while creating transaction' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, app_1.SignTransaction)(priv_key, unsignedTx)];
            case 3:
                signedTx = _b.sent();
                return [4 /*yield*/, (0, ogmios_1.SubmitTransaction)(originChain, signedTx)];
            case 4:
                submitResult = _b.sent();
                res.json({ message: submitResult });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('Error while processing transaction:', error_1);
                res.status(500).json({ error: 'Error while processing transaction' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Define a route for POST requests
app.post('/api/createAndSignBatchingTx', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, chainId, recv_addr, amount, originChain, senderAddress, privKey, unsignedTx, signedTx, submitResult, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, chainId = _a.chainId, recv_addr = _a.recv_addr, amount = _a.amount;
                if (!chainId || !recv_addr || !amount) {
                    res.status(400).json({ error: 'Missing required fields in request body' });
                    return [2 /*return*/];
                }
                originChain = chainId.toLowerCase();
                if (originChain !== 'prime' && originChain !== 'vector') {
                    res.status(400).json({ error: 'Invalid chainId value' });
                    return [2 /*return*/];
                }
                senderAddress = chainId === "prime" ? process.env.MULTISIG_ADDRESS_PRIME : process.env.MULTISIG_ADDRESS_VECTOR;
                privKey = chainId === "prime" ? process.env.MULTISIG_PK_PRIME : process.env.MULTISIG_PK_VECTOR;
                // Check if senderAddress and privKey are set in environment variables
                if (!senderAddress || !privKey) {
                    res.status(500).json({ error: 'Multisig address or private key not set in environment variables' });
                    return [2 /*return*/];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, (0, app_1.CreateTx)(originChain, senderAddress, recv_addr, amount, undefined)];
            case 2:
                unsignedTx = _b.sent();
                if (!unsignedTx) {
                    res.status(500).json({ error: 'Error while creating transaction' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, app_1.SignTransaction)(privKey, unsignedTx)];
            case 3:
                signedTx = _b.sent();
                return [4 /*yield*/, (0, ogmios_1.SubmitTransaction)(originChain, signedTx)];
            case 4:
                submitResult = _b.sent();
                res.json({ message: submitResult });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _b.sent();
                console.error('Error while processing transaction:', error_2);
                res.status(500).json({ error: 'Error while processing transaction' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Start the server
app.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
