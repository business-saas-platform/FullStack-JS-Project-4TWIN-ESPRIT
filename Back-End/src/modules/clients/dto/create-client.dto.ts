import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateClientDto {
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @IsNotEmpty() address!: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsString() @IsNotEmpty() postalCode!: string;
  @IsString() @IsNotEmpty() country!: string;

  @IsOptional() @IsString() taxId?: string;

  @IsIn(["individual","company"]) type!: any;
  @IsOptional() @IsIn(["active","inactive"]) status?: any;

  @IsOptional() @IsString() lastContactDate?: string;
  @IsOptional() @IsString() notes?: string;
}
