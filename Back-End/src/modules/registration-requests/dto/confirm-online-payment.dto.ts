import { IsOptional, IsString, MaxLength } from "class-validator";

export class ConfirmOnlinePaymentDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider?: string;

  @IsString()
  @MaxLength(120)
  orderId!: string;
}
