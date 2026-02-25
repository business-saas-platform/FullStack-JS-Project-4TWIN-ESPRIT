import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class CreateInvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber!: string;

  // ✅ make optional (businessId comes from guard/header)
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @IsUUID()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  issueDate!: string;

  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsIn(["draft", "sent", "viewed", "paid", "overdue", "cancelled"])
  status?: any;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}