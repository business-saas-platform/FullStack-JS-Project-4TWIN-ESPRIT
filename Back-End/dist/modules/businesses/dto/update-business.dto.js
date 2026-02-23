"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_business_dto_1 = require("./create-business.dto");
class UpdateBusinessDto extends (0, mapped_types_1.PartialType)(create_business_dto_1.CreateBusinessDto) {
}
exports.UpdateBusinessDto = UpdateBusinessDto;
//# sourceMappingURL=update-business.dto.js.map