import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ApproveRequestDto {
  // optionnel si admin veut compléter au moment d’approbation
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() fiscalYearStart?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() taxId?: string;
}

export class RejectRequestDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
