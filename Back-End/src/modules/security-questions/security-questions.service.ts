import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SecurityQuestion } from './security-questions.entity';
import {
  SetupSecurityQuestionsDto,
  ForgotPasswordInitDto,
  VerifySecurityAnswersDto,
  ResetPasswordDto,
} from './security-questions.dto';
import { UsersService } from '../users/users.service';

const SALT_ROUNDS = 12;

@Injectable()
export class SecurityQuestionsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SecurityQuestion)
    private readonly sqRepo: Repository<SecurityQuestion>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  // ──────────────────────────────────────────────
  // SETUP: called after first-login password change
  // ──────────────────────────────────────────────
  async setupQuestions(userId: string, dto: SetupSecurityQuestionsDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sqRepo = queryRunner.manager.getRepository(SecurityQuestion);

      // 1. Delete existing questions
      await sqRepo.delete({ userId });

      // 2. Find user
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 3. Create and save new questions
      for (let i = 0; i < dto.questions.length; i++) {
        const item = dto.questions[i];
        const answerHash = await bcrypt.hash(item.answer.trim().toLowerCase(), SALT_ROUNDS);
        const newQuestion = sqRepo.create({
          user,
          userId: user.id,
          questionIndex: i,
          question: item.question,
          answerHash,
        });
        await sqRepo.save(newQuestion);
      }

      await queryRunner.commitTransaction();
      return { message: 'Security questions saved successfully.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Log the error for debugging
      console.error('Transaction failed:', error);
      throw new InternalServerErrorException(
        'Failed to save security questions due to a server error.'
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Check if user has set up security questions
  async hasQuestions(userId: string): Promise<boolean> {
    const count = await this.sqRepo.count({ where: { userId } });
    return count === 3;
  }

  // Return the questions (without answers) for a user — used in recovery flow
  async getQuestionsForUser(userId: string): Promise<string[]> {
    const records = await this.sqRepo.find({
      where: { userId },
      order: { questionIndex: 'ASC' },
    });
    if (records.length < 3) {
      throw new NotFoundException('Security questions not set up for this user.');
    }
    return records.map((r) => r.question);
  }

  // ──────────────────────────────────────────────
  // FORGOT PASSWORD — Step 1: init
  // Returns questions + a short-lived token (no password exposure)
  // ──────────────────────────────────────────────
  async forgotPasswordInit(dto: ForgotPasswordInitDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Return generic message to prevent email enumeration
      return {
        message: 'If this email is registered, you will receive recovery questions.',
        questions: null,
        resetToken: null,
      };
    }

    const questions = await this.getQuestionsForUser(user.id).catch(() => null);
    if (!questions) {
      return {
        message: 'No security questions found. Please contact an admin.',
        questions: null,
        resetToken: null,
      };
    }

    // Issue a short-lived token (5 min) scoped to "answer questions"
    const resetToken = this.jwtService.sign(
      { sub: user.id, stage: 'verify_questions' },
      { expiresIn: '5m' }
    );

    return { questions, resetToken };
  }

  // ──────────────────────────────────────────────
  // FORGOT PASSWORD — Step 2: verify answers
  // ──────────────────────────────────────────────
  async verifySecurityAnswers(dto: VerifySecurityAnswersDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.resetToken);
    } catch {
      throw new UnauthorizedException('Reset token expired or invalid.');
    }

    if (payload.stage !== 'verify_questions') {
      throw new UnauthorizedException('Invalid token stage.');
    }

    const records = await this.sqRepo.find({
      where: { userId: payload.sub },
      order: { questionIndex: 'ASC' },
    });

    if (records.length < 3) {
      throw new NotFoundException('Security questions not found.');
    }

    // Verify all 3 answers
    const results = await Promise.all(
      records.map((record, i) => {
        const submitted = dto.answers[i]?.answer?.trim().toLowerCase() ?? '';
        return bcrypt.compare(submitted, record.answerHash);
      })
    );

    if (!results.every(Boolean)) {
      throw new UnauthorizedException('One or more answers are incorrect.');
    }

    // Issue a "verified" token valid for 10 min to actually reset password
    const verifiedToken = this.jwtService.sign(
      { sub: payload.sub, stage: 'reset_password' },
      { expiresIn: '10m' }
    );

    return { verifiedToken, message: 'Answers verified. You may now reset your password.' };
  }

  // ──────────────────────────────────────────────
  // FORGOT PASSWORD — Step 3: reset password
  // ──────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.resetToken);
    } catch {
      throw new UnauthorizedException('Reset token expired or invalid.');
    }

    if (payload.stage !== 'reset_password') {
      throw new UnauthorizedException('Invalid token stage.');
    }

    await this.usersService.updatePassword(payload.sub, dto.newPassword);

    return { message: 'Password reset successfully. Please log in.' };
  }
}
