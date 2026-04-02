import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAIInsightDto {
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @IsIn(["prediction","warning","recommendation","opportunity"])
  type!: any;

  @IsIn(["revenue","expenses","clients","cash_flow","invoices"])
  category!: any;

  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() description!: string;

  @IsNumber() confidence!: number;
  @IsBoolean() actionable!: boolean;

  @IsOptional() @IsString() action?: string;

  @IsOptional() @IsIn(["high","medium","low"])
  impact?: any;
}
