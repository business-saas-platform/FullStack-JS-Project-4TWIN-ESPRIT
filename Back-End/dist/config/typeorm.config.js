"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const business_entity_1 = require("../modules/businesses/entities/business.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
const client_entity_1 = require("../modules/clients/entities/client.entity");
const invoice_entity_1 = require("../modules/invoices/entities/invoice.entity");
const invoice_item_entity_1 = require("../modules/invoices/entities/invoice-item.entity");
const expense_entity_1 = require("../modules/expenses/entities/expense.entity");
const team_member_entity_1 = require("../modules/team-members/entities/team-member.entity");
const ai_insight_entity_1 = require("../modules/ai-insights/entities/ai-insight.entity");
const typeOrmConfig = () => ({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [
        business_entity_1.BusinessEntity,
        user_entity_1.UserEntity,
        client_entity_1.ClientEntity,
        invoice_entity_1.InvoiceEntity,
        invoice_item_entity_1.InvoiceItemEntity,
        expense_entity_1.ExpenseEntity,
        team_member_entity_1.TeamMemberEntity,
        ai_insight_entity_1.AIInsightEntity,
    ],
    autoLoadEntities: true,
    synchronize: true
});
exports.typeOrmConfig = typeOrmConfig;
//# sourceMappingURL=typeorm.config.js.map