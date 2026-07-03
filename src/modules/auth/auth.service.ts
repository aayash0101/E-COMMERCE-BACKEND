import { userRepository } from '@repositories/user.repository';
import { hashPassword, comparePassword } from '@utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '@utils/token';
import { ApiError } from '@utils/ApiError';
import { RegisterInput, LoginInput } from './auth.validation';
import { IUser } from '@models/user.model';

interface AuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

async function issueTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });
  const refreshToken = generateRefreshToken(user._id.toString());

  await userRepository.setRefreshToken(user._id.toString(), hashToken(refreshToken));

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'customer',
    });

    const tokens = await issueTokens(user);
    return { user, ...tokens };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email, true);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('This account has been deactivated');
    }

    const tokens = await issueTokens(user);
    return { user, ...tokens };
  },

  async refresh(presentedToken: string): Promise<{ accessToken: string; user: IUser }> {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(presentedToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
    const user = await userRepository.findById(payload.userId, true);
    if (!user || !user.refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    if (hashToken(presentedToken) !== user.refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    return { accessToken, user };
  },

  async logout(userId: string): Promise<void> {
    await userRepository.setRefreshToken(userId, null);
  },
};