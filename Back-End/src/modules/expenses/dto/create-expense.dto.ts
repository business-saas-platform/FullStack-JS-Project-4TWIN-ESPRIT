import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateExpenseDto {
  @IsUUID()
  @IsOptional()
  businessId?: string;
  @IsString() date!: string;
  @IsNumber() amount!: number;
  @IsString() currency!: string;
  @IsString() category!: string;
  @IsString() vendor!: string;
  @IsString() description!: string;
  @IsString() paymentMethod!: string;

  @IsOptional() @IsIn(["pending","approved","rejected"]) status?: any;

  @IsOptional() @IsString() receiptUrl?: string;

  @IsString() submittedBy!: string;
  @IsOptional() @IsString() approvedBy?: string;
}
