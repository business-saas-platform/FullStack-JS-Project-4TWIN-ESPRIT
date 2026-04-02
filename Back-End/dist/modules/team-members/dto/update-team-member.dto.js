"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeamMemberDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_team_member_dto_1 = require("./create-team-member.dto");
class UpdateTeamMemberDto extends (0, mapped_types_1.PartialType)(create_team_member_dto_1.CreateTeamMemberDto) {
}
exports.UpdateTeamMemberDto = UpdateTeamMemberDto;
//# sourceMappingURL=update-team-member.dto.js.map