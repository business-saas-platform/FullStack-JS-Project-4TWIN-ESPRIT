"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessId = void 0;
const common_1 = require("@nestjs/common");
exports.BusinessId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.businessId;
});
//# sourceMappingURL=business-id.decorator.js.map