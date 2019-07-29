"use strict";
// Only import this file once, at entrypoint
// See https://github.com/motdotla/dotenv/tree/master/examples/typescript
exports.__esModule = true;
var dotenv_1 = require("dotenv");
var result = dotenv_1.config();
// Only override process.env if .env file is present and valid
if (!result.error) {
    Object.keys(result.parsed).forEach(function (key) {
        var value = result.parsed[key];
        if (value) {
            process.env[key] = value;
        }
    });
}
//# sourceMappingURL=env.js.map