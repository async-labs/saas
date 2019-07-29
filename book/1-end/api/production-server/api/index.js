"use strict";
exports.__esModule = true;
var logs_1 = require("../logs");
var public_1 = require("./public");
// 10
// import teamLeaderApi from './team-leader';
var team_member_1 = require("./team-member");
function handleError(err, _, res, __) {
    logs_1["default"].error(err.stack);
    res.json({ error: err.message || err.toString() });
}
function api(server) {
    server.use('/api/v1/public', public_1["default"], handleError);
    // 10
    // server.use('/api/v1/team-leader', teamLeaderApi, handleError);
    server.use('/api/v1/team-member', team_member_1["default"], handleError);
}
exports["default"] = api;
//# sourceMappingURL=index.js.map