import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { EmailService } from 'src/services/email.service';
import { differenceInSeconds } from 'date-fns';
import { UserEntity } from 'libs/index';
import { EmojiService } from './emoji.service';
import { UserManager } from 'src/managers/User.manager';

const saltRounds = 10;

const verificationTimeout = -900; //15 minutes

@Injectable()
export class AuthService {
  constructor(
    private userManager: UserManager,
    private jwtService: JwtService,
    private emailService: EmailService,
    private emojiService: EmojiService,
  ) {}

  async signup(email: string, username: string, pass: string) {
    const user = new UserEntity({
      Email: email.toLowerCase().trim(),
      Username: username.toLowerCase().trim(),
      Password: await this.hashPassword(pass),
    });

    this.userManager.put('SYSTEM', user);
    return true;
  }

  async signIn(username: string, pass: string, rememberMe: boolean) {
    username = username.toLowerCase().trim();
    const user = await this.checkUsernameAndPassword(username, pass);

    if (user.EmailVerified === false) {
      const emojis = this.emojiService.getEmojis();
      user.EmailVerificationCode = emojis.join('');
      user.EmailVerificationCodeDateTime = new Date().toISOString();
      await this.userManager.runUpdate('SYSTEM', user);
      this.emailService.sendEmail(
        'Signup Verification',
        `Welcome to BoardGame.lol! Your signup verification code is: '${user.EmailVerificationCode}' The verification code will expire in 15 minutes. If you did not request this code please ignore this email.`,
        this.emailService.formatEmailHtml(
          `Hello, ${user.Username}! 👋`,
          `
        <p>Welcome to BoardGame.lol,</p>
        <p>Your signup verification code is:</p>
        <p class="bold">${user.EmailVerificationCode}</p>
        <p>The verification code will expire in 15 minutes</p>
        <p>Emojis may look slightly different between devices.</p>
        <p>If you did not request this code please ignore this email.</p>
        `,
        ),
        user.Email,
      );
      return {
        ok: false,
        emojis: this.emojiService.getEmojiToChoose(emojis),
      };
    } else {
      // continue
    }

    const payload = { userId: user.UserId, username: user.Username };
    return {
      ok: true,
      access_token: await this.jwtService.signAsync(payload, { expiresIn: rememberMe ? '30 days' : '12 hours' }),
    };
  }

  async verifyEmail(username: string, pass: string, rememberMe: boolean, verification: string) {
    username = username.toLowerCase().trim();
    const user = await this.checkUsernameAndPassword(username, pass);

    if (
      user.EmailVerificationCode === verification &&
      differenceInSeconds(user.EmailVerificationCodeDateTime ?? new Date(), new Date()) > verificationTimeout
    ) {
      user.EmailVerificationCode = null;
      user.EmailVerificationCodeDateTime = null;
      user.EmailVerified = true;
      await this.userManager.runUpdate('SYSTEM', user);
    } else {
      throw new HttpException('Verification Code Incorrect', HttpStatus.UNAUTHORIZED);
    }

    const payload = { userId: user.UserId, username: user.Username };
    return {
      ok: true,
      access_token: await this.jwtService.signAsync(payload, { expiresIn: rememberMe ? '30 days' : '12 hours' }),
    };
  }

  /**
   * Find the username/email in db and check the password
   * @param usernameEmail value user entered on sign-in form
   * @param password user entered password
   * @returns User entity or throws an exception
   */
  async checkUsernameAndPassword(usernameEmail: string, password: string) {
    usernameEmail = usernameEmail.toLowerCase().trim();
    if (password.length === 0) {
      throw new HttpException('Username or Password Incorrect', HttpStatus.UNAUTHORIZED);
    } else {
      // continue
    }

    let user = this.userManager.findUser(usernameEmail);
    if (!user) {
      throw new HttpException('Username or Password Incorrect', HttpStatus.UNAUTHORIZED);
    } else {
      user = this.userManager.new(user);
    }

    const match = await this.comparePasswords(password, user.Password);
    if (match === false) {
      throw new HttpException('Username or Password Incorrect', HttpStatus.UNAUTHORIZED);
    } else {
      // continue
    }

    return user;
  }

  async resetPasswordRequest(usernameEmail: string) {
    usernameEmail = usernameEmail.toLowerCase().trim();
    let user = this.userManager.findUser(usernameEmail);
    if (!user) {
      throw new HttpException('Username Or Email not found', HttpStatus.NOT_FOUND);
    } else {
      user = this.userManager.new(user);
    }

    const emojis = this.emojiService.getEmojis();
    user.PasswordResetCode = emojis.join('');
    user.PasswordResetCodeDateTime = new Date().toISOString();
    await this.userManager.runUpdate('SYSTEM', user);
    this.emailService.sendEmail(
      'Password Reset',
      `Your password reset verification code is: '${user.PasswordResetCode}' The verification code will expire in 15 minutes. If you did not request this code please do not enter the verification code anywhere.`,
      this.emailService.formatEmailHtml(
        `Hello, ${user.Username}! 👋`,
        `
        <p>Your password reset verification code is:</p>
        <p class="bold">${user.PasswordResetCode}</p>
        <p>The verification code will expire in 15 minutes</p>
        <p>Emojis may look slightly different between devices.</p>
        <p>If you did not request this code please ignore this email.</p>
        `,
      ),
      user.Email,
    );
    return {
      ok: true,
      emojis: this.emojiService.getEmojiToChoose(emojis),
    };
  }

  /**
   * Can the user enter a new password?
   * @param usernameEmail username or email
   * @param verification emoji verification code
   * @returns true if user can reset the password
   */
  resetPasswordCheck(usernameEmail: string, verification: string): boolean {
    usernameEmail = usernameEmail.toLowerCase().trim();
    let user = this.userManager.findUser(usernameEmail);
    if (!user) {
      throw new HttpException('Username Or Email not found', HttpStatus.NOT_FOUND);
    } else {
      user = this.userManager.new(user);
    }

    return (
      user.PasswordResetCode === verification &&
      differenceInSeconds(user.PasswordResetCodeDateTime ?? new Date(), new Date()) > verificationTimeout
    );
  }

  async resetPassword(usernameEmail: string, verification: string, password: string): Promise<boolean> {
    usernameEmail = usernameEmail.toLowerCase().trim();
    let user = this.userManager.findUser(usernameEmail);
    if (!user) {
      throw new HttpException('Username Or Email not found', HttpStatus.NOT_FOUND);
    } else {
      user = this.userManager.new(user);
    }

    if (
      user.PasswordResetCode === verification &&
      differenceInSeconds(user.PasswordResetCodeDateTime ?? new Date(), new Date()) > verificationTimeout
    ) {
      user.Password = await this.hashPassword(password);
      user.PasswordResetCode = null;
      user.PasswordResetCodeDateTime = null;
      await this.userManager.runUpdate('SYSTEM', user);
    } else {
      throw new HttpException('Verification Code Incorrect', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  async changePassword(userId: string, currentPassword: string, password: string): Promise<boolean> {
    const user = this.userManager.getUser(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else {
      // Continue
    }

    const match = await this.comparePasswords(currentPassword, user.Password);
    if (match === false) {
      throw new HttpException('Password Incorrect', HttpStatus.UNAUTHORIZED);
    } else {
      // continue
    }

    user.Password = await this.hashPassword(password);
    await this.userManager.runUpdate(userId, user);

    return true;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(saltRounds);
    return await hash(password, salt);
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword);
  }
}
