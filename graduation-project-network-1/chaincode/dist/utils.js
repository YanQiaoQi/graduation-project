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
Object.defineProperty(exports, "__esModule", { value: true });
exports.putState = exports.getState = exports.isEnoughArgus = void 0;
const isEnoughArgus = (func, argus, number) => {
    if (argus.length !== number) {
        throw new Error(` ${func} 调用参数不足`);
    }
};
exports.isEnoughArgus = isEnoughArgus;
const getState = (stub, key) => __awaiter(void 0, void 0, void 0, function* () {
    const dataAsBytes = yield stub.getState(key);
    if (!dataAsBytes || dataAsBytes.toString().length === 0) {
        throw new Error(`${key}不存在`);
    }
    return JSON.parse(dataAsBytes.toString());
});
exports.getState = getState;
const putState = (stub, key, value) => __awaiter(void 0, void 0, void 0, function* () {
    stub.putState(key, Buffer.from(JSON.stringify(value)));
});
exports.putState = putState;
