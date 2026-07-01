import { User, IUser, UserRole } from '@models/user.model';

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export const userRepository = {
  async create(data: CreateUserInput): Promise<IUser> {
    return User.create(data);
  },

    async updateRole(userId: string, role: UserRole): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { role }, { new: true }).exec();
  },

  async findAll(): Promise<IUser[]> {
    return User.find().select('-passwordHash').exec();
  },

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({ email });
    if (includePassword) query.select('+passwordHash');
    return query.exec();
  },

  async findById(id: string, includeRefreshToken = false): Promise<IUser | null> {
    const query = User.findById(id);
    if (includeRefreshToken) query.select('+refreshToken');
    return query.exec();
  },

  async setRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: hashedToken });
  },
};