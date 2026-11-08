import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';

const HTTP_STATUS_LOCKED = 423;

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

@Injectable()
export class AuthService {
  // Pre-hashed dummy bcrypt hash used to equalize response timing when email does not exist
  private readonly dummyBcryptHash =
    '$2b$12$e80yvXf5GZ4YFzR.4Hw.1uH9uXpXQZ7K.0a0o6a1e.2e3e4e5e6e7';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Authenticates user credentials, enforces account lockout policies,
   * creates an authenticated session and returns access token + initial refresh token.
   */
  async login(loginDto: LoginDto, metadata: RequestMetadata) {
    const { email, password } = loginDto;

    // 1. Find user by email in system context
    const user = await this.prisma.runInSystemContext(async (tx) => {
      return tx.user.findFirst({
        where: { email: email.toLowerCase().trim() },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
            },
          },
        },
      });
    });

    // Timing attack mitigation: if user not found, perform dummy bcrypt compare
    if (!user) {
      await this.cryptoService.comparePassword(password, this.dummyBcryptHash);
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Địa chỉ email hoặc mật khẩu không chính xác.',
      });
    }

    // 2. Check Account Lockout (Tiered Lockout policy: HTTP 423 Locked)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000),
      );
      throw new HttpException(
        {
          code: 'AUTH_ACCOUNT_LOCKED',
          message: `Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${remainingMinutes} phút.`,
          lockedUntil: user.lockedUntil.toISOString(),
        },
        HTTP_STATUS_LOCKED, // 423 Locked
      );
    }

    // 3. Verify Password
    const isPasswordValid = await this.cryptoService.comparePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const willLock = newAttempts >= 5;
      const lockedUntil = willLock
        ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes lockout
        : null;

      await this.prisma.runInSystemContext(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: willLock ? 0 : newAttempts,
            lockedUntil,
          },
        });
      });

      if (willLock) {
        throw new HttpException(
          {
            code: 'AUTH_ACCOUNT_LOCKED',
            message: 'Tài khoản đã bị tạm khóa 15 phút do nhập sai mật khẩu 5 lần liên tiếp.',
            lockedUntil: lockedUntil?.toISOString(),
          },
          HTTP_STATUS_LOCKED, // 423 Locked
        );
      }

      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Địa chỉ email hoặc mật khẩu không chính xác.',
        attemptsRemaining: 5 - newAttempts,
      });
    }

    // 4. Verify Account & Organization Status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        code: 'AUTH_USER_DISABLED',
        message: 'Tài khoản của bạn hiện đang bị vô hiệu hóa.',
      });
    }

    if (user.organization.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        code: 'AUTH_ORGANIZATION_INACTIVE',
        message: 'Tổ chức doanh nghiệp của bạn đang tạm ngừng hoạt động.',
      });
    }

    // 5. Reset lockout counter on successful password verification
    await this.prisma.runInSystemContext(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
    });

    // 6. Create Session, Token Family, and Initial Refresh Token (seq=1) in an atomic transaction
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const plaintextRefreshToken = this.cryptoService.generateSecureToken();
    const tokenHash = this.cryptoService.hashToken(plaintextRefreshToken);

    const result = await this.prisma.runInSystemContext(async (tx) => {
      // Create user session
      const session = await tx.userSession.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          status: 'ACTIVE',
          deviceId: metadata.deviceId || null,
          ipAddress: metadata.ipAddress || null,
          userAgent: metadata.userAgent || null,
          expiresAt: sessionExpiresAt,
        },
      });

      // Create token family (1-to-1 boundary with session)
      const tokenFamily = await tx.tokenFamily.create({
        data: {
          sessionId: session.id,
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      // Create initial refresh token (sequence = 1)
      await tx.refreshTokenRecord.create({
        data: {
          sessionId: session.id,
          tokenFamilyId: tokenFamily.id,
          tokenHash,
          sequenceNumber: 1,
          status: 'ACTIVE',
          expiresAt: sessionExpiresAt,
        },
      });

      return { session, tokenFamily };
    });

    // 7. Sign Access Token (15 minutes)
    const accessPayload = {
      sub: user.id,
      email: user.email,
      orgId: user.organizationId,
      sessionId: result.session.id,
      authVersion: user.authVersion,
    };
    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: '15m' });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      organizationCode: user.organization.code,
    };

    return {
      accessToken,
      refreshToken: plaintextRefreshToken,
      user: sanitizedUser,
      sessionId: result.session.id,
    };
  }

  /**
   * Refreshes access token and rotates refresh token.
   */
  async refresh(
    plaintextToken: string,
    idempotencyKey?: string,
    endpoint: string = '/api/v1/auth/refresh',
  ) {
    return this.refreshTokenService.rotate(plaintextToken, idempotencyKey, endpoint);
  }

  /**
   * Revokes session, token family, and all active refresh tokens for the current session.
   */
  async logout(sessionId: string) {
    if (!sessionId) return { success: true };

    await this.prisma.runInSystemContext(async (tx) => {
      await tx.userSession.updateMany({
        where: { id: sessionId, status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });

      const families = await tx.tokenFamily.findMany({
        where: { sessionId, status: 'ACTIVE' },
        select: { id: true },
      });

      const familyIds = families.map((f) => f.id);
      if (familyIds.length > 0) {
        await tx.tokenFamily.updateMany({
          where: { id: { in: familyIds } },
          data: { status: 'REVOKED', revokedAt: new Date() },
        });

        await tx.refreshTokenRecord.updateMany({
          where: { tokenFamilyId: { in: familyIds }, status: 'ACTIVE' },
          data: { status: 'REVOKED' },
        });
      }
    });

    return { success: true, message: 'Đăng xuất thành công.' };
  }

  /**
   * Fetches profile and organization details for the authenticated user.
   */
  async getMe(userId: string, organizationId: string) {
    const user = await this.prisma.runInSystemContext(async (tx) => {
      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
              taxCode: true,
              email: true,
              phone: true,
              address: true,
              currency: true,
              timezone: true,
              status: true,
            },
          },
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  rolePermissions: {
                    select: {
                      permission: {
                        select: {
                          id: true,
                          code: true,
                          module: true,
                          action: true,
                          description: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'Không tìm thấy thông tin tài khoản người dùng.',
      });
    }

    // Extract flat list of permissions
    const permissions = new Set<string>();
    user.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.code);
      });
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      organization: user.organization,
      roles: user.userRoles.map((ur) => ({ id: ur.role.id, code: ur.role.code, name: ur.role.name })),
      permissions: Array.from(permissions),
    };
  }

  /**
   * Revokes all active sessions for a user, invalidates all active token families,
   * and increments users.auth_version so that all existing JWTs are immediately rejected.
   */
  async logoutAll(userId: string) {
    await this.prisma.runInSystemContext(async (tx) => {
      // 1. Increment authVersion
      await tx.user.update({
        where: { id: userId },
        data: { authVersion: { increment: 1 } },
      });

      // 2. Revoke all active sessions
      await tx.userSession.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'REVOKED' },
      });

      // 3. Revoke all active token families
      await tx.tokenFamily.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });

      // 4. Revoke all active refresh tokens for the user
      const userSessions = await tx.userSession.findMany({
        where: { userId },
        select: { id: true },
      });
      const sessionIds = userSessions.map((s) => s.id);
      if (sessionIds.length > 0) {
        await tx.refreshTokenRecord.updateMany({
          where: { sessionId: { in: sessionIds }, status: 'ACTIVE' },
          data: { status: 'REVOKED' },
        });
      }
    });

    return {
      success: true,
      message: 'Đăng xuất tất cả thiết bị thành công. Toàn bộ phiên làm việc đã bị thu hồi.',
    };
  }

  /**
   * Requests an OTP unlock code for a locked account.
   * Mitigates account enumeration by always returning HTTP 200 OK with identical messaging.
   */
  async requestUnlock(email: string) {
    const user = await this.prisma.runInSystemContext(async (tx) => {
      return tx.user.findFirst({
        where: { email: email.toLowerCase().trim() },
      });
    });

    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      const now = new Date();
      if (
        user.lastUnlockOtpSentAt &&
        now.getTime() - user.lastUnlockOtpSentAt.getTime() < 60 * 1000
      ) {
        return {
          message:
            'Nếu email của bạn tồn tại trên hệ thống, mã mở khóa đã được gửi tới hòm thư của bạn.',
          sent: true,
        };
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = this.cryptoService.hashOtp(otpCode);
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.prisma.runInSystemContext(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            unlockOtpHash: otpHash,
            unlockOtpExpiresAt: otpExpiresAt,
            unlockOtpAttempts: 0,
            lastUnlockOtpSentAt: now,
          },
        });
      });
    }

    // Artificial jitter 50-100ms
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 50));

    return {
      message:
        'Nếu email của bạn tồn tại trên hệ thống, mã mở khóa đã được gửi tới hòm thư của bạn.',
      sent: true,
    };
  }

  /**
   * Validates OTP code and unlocks account.
   */
  async unlockAccount(email: string, otpCode: string) {
    const user = await this.prisma.runInSystemContext(async (tx) => {
      return tx.user.findFirst({
        where: { email: email.toLowerCase().trim() },
      });
    });

    if (!user || !user.unlockOtpHash || !user.unlockOtpExpiresAt) {
      throw new UnauthorizedException({
        code: 'AUTH_OTP_INVALID',
        message: 'Mã mở khóa không hợp lệ hoặc đã hết hạn.',
      });
    }

    if (user.unlockOtpExpiresAt < new Date()) {
      await this.prisma.runInSystemContext(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            unlockOtpHash: null,
            unlockOtpExpiresAt: null,
            unlockOtpAttempts: 0,
          },
        });
      });
      throw new UnauthorizedException({
        code: 'AUTH_OTP_EXPIRED',
        message: 'Mã mở khóa đã hết hạn. Vui lòng yêu cầu mã mới.',
      });
    }

    const isValid = this.cryptoService.verifyOtpHash(otpCode, user.unlockOtpHash);
    if (!isValid) {
      const attempts = user.unlockOtpAttempts + 1;
      const willRevoke = attempts >= 3;

      await this.prisma.runInSystemContext(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            unlockOtpAttempts: attempts,
            unlockOtpHash: willRevoke ? null : user.unlockOtpHash,
            unlockOtpExpiresAt: willRevoke ? null : user.unlockOtpExpiresAt,
          },
        });
      });

      if (willRevoke) {
        throw new UnauthorizedException({
          code: 'AUTH_OTP_MAX_ATTEMPTS',
          message: 'Mã mở khóa đã bị hủy do nhập sai quá 3 lần. Vui lòng yêu cầu mã mới.',
        });
      }

      throw new UnauthorizedException({
        code: 'AUTH_OTP_INVALID',
        message: 'Mã mở khóa không chính xác.',
        attemptsRemaining: 3 - attempts,
      });
    }

    // Valid OTP -> unlock account
    await this.prisma.runInSystemContext(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
          unlockOtpHash: null,
          unlockOtpExpiresAt: null,
          unlockOtpAttempts: 0,
        },
      });
    });

    return {
      unlockedAt: new Date().toISOString(),
      message: 'Mở khóa tài khoản thành công. Bạn có thể đăng nhập bình thường.',
    };
  }
}
