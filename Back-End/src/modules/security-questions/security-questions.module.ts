import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityQuestion } from './security-questions.entity';
import { SecurityQuestionsService } from './security-questions.service';
import { SecurityQuestionsController } from './security-questions.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ForgotPasswordController } from './forgot-password.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([SecurityQuestion]),
    UsersModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [SecurityQuestionsService],
  controllers: [SecurityQuestionsController, ForgotPasswordController],
  exports: [SecurityQuestionsService],
})
export class SecurityQuestionsModule {}
