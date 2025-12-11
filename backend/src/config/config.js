"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbCfg = void 0;
var config = require("config");
exports.dbCfg = config.get('dbConfig');
console.log(exports.dbCfg);
