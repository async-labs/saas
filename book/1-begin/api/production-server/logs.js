"use strict";
exports.__esModule = true;
var winston = require("winston");
var consts_1 = require("./consts");
var logger = winston.createLogger({
    format: winston.format.simple(),
    level: !consts_1.IS_DEV ? 'info' : 'debug',
    transports: [new winston.transports.Console()]
});
exports["default"] = logger;
//# sourceMappingURL=logs.js.map