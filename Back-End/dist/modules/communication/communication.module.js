"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const communication_service_controller_1 = require("./communication.service-controller");
const communication_gateway_1 = require("./communication.gateway");
const channel_entity_1 = require("./channel.entity");
const message_entity_1 = require("./message.entity");
const user_entity_1 = require("../users/entities/user.entity");
let CommunicationModule = class CommunicationModule {
};
exports.CommunicationModule = CommunicationModule;
exports.CommunicationModule = CommunicationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([channel_entity_1.ChannelEntity, message_entity_1.MessageEntity, user_entity_1.UserEntity]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secretKey',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        controllers: [communication_service_controller_1.CommunicationController],
        providers: [communication_service_controller_1.CommunicationService, communication_gateway_1.CommunicationGateway],
        exports: [communication_service_controller_1.CommunicationService],
    })
], CommunicationModule);
//# sourceMappingURL=communication.module.js.map