import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockCompare = jest.fn();
const mockHash = jest.fn();
const mockSign = jest.fn();
const mockVerify = jest.fn();
const mockGetRedisClient = jest.fn();

const mockGetCache = jest.fn();
const mockSetCache = jest.fn();
const mockDeleteCache = jest.fn();

jest.unstable_mockModule('../../src/modules/auth/auth.model.js', () => ({
  default: {
    findOne: mockFindOne,
    findById: mockFindById,
    create: mockCreate,
    findOneAndUpdate: mockFindOneAndUpdate,
  },
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: mockCompare,
    hash: mockHash,
  },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign,
    verify: mockVerify,
  },
}));

jest.unstable_mockModule('../../src/shared/utils/redis.js', () => ({
  getRedisClient: mockGetRedisClient,
}));

jest.unstable_mockModule('../../src/shared/utils/cacheHelper.js', () => ({
  getCache: mockGetCache,
  setCache: mockSetCache,
  deleteCache: mockDeleteCache,
}));

jest.unstable_mockModule('../../src/config/env.js', () => ({
  default: {
    JWT_ACCESS_SECRET: 'test-access-secret-1234567890123456',
    JWT_EXPIRES_IN: '15m',
    REFRESH_SECRET: 'test-refresh-secret-123456789012345',
    REFRESH_EXPIRES_IN: '7d',
  },
}));

const {
  createUser: serviceCreateUser,
  loginUser,
  refreshTokens,
  logout,
  getProfile,
  updateProfile,
  addAddress,
  removeAddress,
  setDefaultAddress,
  toggleFavouriteProduct,
} = await import('../../src/modules/auth/auth.service.js');

const createRedisMock = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
});

const createTestUser = (overrides = {}) => {
  const user = {
    _id: 'user-1',
    email: 'user@example.com',
    role: 'CUSTOMER',
    passwordHash: 'hashed-password',
    isActive: true,
    savedAddresses: [],
    favouriteProductIds: [],
    save: jest.fn().mockResolvedValue(true),
    toJSON() {
      return {
        _id: this._id,
        email: this.email,
        role: this.role,
        isActive: this.isActive,
        savedAddresses: this.savedAddresses,
        favouriteProductIds: this.favouriteProductIds,
      };
    },
    ...overrides,
  };
  user.save = user.save || jest.fn().mockResolvedValue(true);
  return user;
};

const mockFindOneResult = (user) => {
  const select = jest.fn().mockResolvedValue(user);
  mockFindOne.mockReturnValue({ select });
  return select;
};

describe('auth.service unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    test('creates a new user successfully and returns tokens', async () => {
      const redis = createRedisMock();
      redis.set.mockResolvedValue('OK');
      mockGetRedisClient.mockResolvedValue(redis);

      mockFindOne.mockResolvedValue(null); // Email not registered
      mockHash.mockResolvedValue('hashed-password-new');
      
      const newUser = createTestUser({ passwordHash: 'hashed-password-new' });
      mockCreate.mockResolvedValue(newUser);

      mockSign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await serviceCreateUser({
        email: 'new-user@example.com',
        password: 'Password123!',
        role: 'CUSTOMER',
        name: 'New User',
      });

      expect(mockFindOne).toHaveBeenCalledWith({ email: 'new-user@example.com' });
      expect(mockHash).toHaveBeenCalledWith('Password123!', 10);
      expect(mockCreate).toHaveBeenCalledWith({
        email: 'new-user@example.com',
        password: 'Password123!',
        role: 'CUSTOMER',
        name: 'New User',
        passwordHash: 'hashed-password-new',
      });
      expect(redis.set).toHaveBeenCalledWith('refresh:user-1', 'refresh-token', { EX: 604800 });
      expect(result).toEqual({
        user: {
          _id: 'user-1',
          email: 'user@example.com',
          role: 'CUSTOMER',
          isActive: true,
          savedAddresses: [],
          favouriteProductIds: [],
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    test('throws conflict error if email is already registered', async () => {
      mockFindOne.mockResolvedValue(createTestUser());

      await expect(
        serviceCreateUser({
          email: 'user@example.com',
          password: 'Password123!',
          role: 'CUSTOMER',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email is already registered',
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    test('returns user data and tokens for valid credentials', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('0');
      redis.del.mockResolvedValue(1);
      redis.set.mockResolvedValue('OK');
      mockGetRedisClient.mockResolvedValue(redis);
      const select = mockFindOneResult(createTestUser());
      mockCompare.mockResolvedValue(true);
      mockSign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await loginUser('USER@example.com', 'plain-password', '127.0.0.1');

      expect(mockFindOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(select).toHaveBeenCalledWith('+passwordHash');
      expect(mockCompare).toHaveBeenCalledWith('plain-password', 'hashed-password');
      expect(redis.get).toHaveBeenCalledWith('login_fail:127.0.0.1:user@example.com');
      expect(redis.del).toHaveBeenCalledWith('login_fail:127.0.0.1:user@example.com');
      expect(redis.set).toHaveBeenCalledWith('refresh:user-1', 'refresh-token', { EX: 604800 });
      expect(mockSign).toHaveBeenNthCalledWith(
        1,
        { sub: 'user-1', role: 'CUSTOMER' },
        'test-access-secret-1234567890123456',
        { expiresIn: '15m' }
      );
      expect(mockSign).toHaveBeenNthCalledWith(
        2,
        { sub: 'user-1', role: 'CUSTOMER' },
        'test-refresh-secret-123456789012345',
        { expiresIn: '7d' }
      );
      expect(result).toEqual({
        user: {
          _id: 'user-1',
          email: 'user@example.com',
          role: 'CUSTOMER',
          isActive: true,
          savedAddresses: [],
          favouriteProductIds: [],
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    test('throws when the password is wrong and increments the brute-force counter', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('0');
      redis.incr.mockResolvedValue(1);
      redis.expire.mockResolvedValue(1);
      mockGetRedisClient.mockResolvedValue(redis);
      const select = mockFindOneResult(createTestUser());
      mockCompare.mockResolvedValue(false);

      await expect(loginUser('user@example.com', 'wrong-password', '127.0.0.1')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });

      expect(redis.incr).toHaveBeenCalledWith('login_fail:127.0.0.1:user@example.com');
      expect(select).toHaveBeenCalledWith('+passwordHash');
      expect(redis.expire).toHaveBeenCalledWith('login_fail:127.0.0.1:user@example.com', 900);
      expect(redis.set).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });

    test('throws when the account is suspended', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('0');
      mockGetRedisClient.mockResolvedValue(redis);
      const select = mockFindOneResult(createTestUser({ isActive: false }));
      mockCompare.mockResolvedValue(true);

      await expect(loginUser('user@example.com', 'plain-password', '127.0.0.1')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Your account has been suspended',
      });

      expect(redis.incr).not.toHaveBeenCalled();
      expect(select).toHaveBeenCalledWith('+passwordHash');
      expect(redis.expire).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
      expect(redis.set).not.toHaveBeenCalled();
    });

    test('blocks login attempts when the brute-force threshold has already been reached', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('5');
      mockGetRedisClient.mockResolvedValue(redis);

      await expect(loginUser('user@example.com', 'plain-password', '127.0.0.1')).rejects.toMatchObject({
        statusCode: 429,
        message: 'Too many login attempts. Try again later.',
      });

      expect(mockFindOne).not.toHaveBeenCalled();
      expect(mockCompare).not.toHaveBeenCalled();
      expect(redis.incr).not.toHaveBeenCalled();
      expect(redis.expire).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    test('rotates tokens successfully for valid refresh token', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('old-refresh-token');
      redis.del.mockResolvedValue(1);
      redis.set.mockResolvedValue('OK');
      mockGetRedisClient.mockResolvedValue(redis);

      mockVerify.mockReturnValue({ sub: 'user-1', role: 'CUSTOMER' });
      mockFindById.mockResolvedValue(createTestUser());
      
      mockSign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await refreshTokens('user-1', 'old-refresh-token');

      expect(redis.get).toHaveBeenCalledWith('refresh:user-1');
      expect(mockVerify).toHaveBeenCalledWith('old-refresh-token', 'test-refresh-secret-123456789012345');
      expect(mockFindById).toHaveBeenCalledWith('user-1');
      expect(redis.del).toHaveBeenCalledWith('refresh:user-1');
      expect(redis.set).toHaveBeenCalledWith('refresh:user-1', 'new-refresh-token', { EX: 604800 });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    test('throws unauthorized if no refresh token is stored in Redis', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue(null);
      mockGetRedisClient.mockResolvedValue(redis);

      await expect(refreshTokens('user-1', 'old-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid refresh token',
      });

      expect(mockVerify).not.toHaveBeenCalled();
    });

    test('throws unauthorized if old refresh token does not match stored token', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('different-stored-token');
      mockGetRedisClient.mockResolvedValue(redis);

      await expect(refreshTokens('user-1', 'old-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid refresh token',
      });

      expect(mockVerify).not.toHaveBeenCalled();
    });

    test('throws unauthorized if refresh token expired during jwt verification', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('old-refresh-token');
      mockGetRedisClient.mockResolvedValue(redis);

      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      mockVerify.mockImplementation(() => {
        throw expiredError;
      });

      await expect(refreshTokens('user-1', 'old-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Refresh token expired',
      });
    });

    test('throws unauthorized if token verification fails with general error', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('old-refresh-token');
      mockGetRedisClient.mockResolvedValue(redis);

      mockVerify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(refreshTokens('user-1', 'old-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid refresh token',
      });
    });

    test('throws unauthorized if token subject sub does not match userId', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('old-refresh-token');
      mockGetRedisClient.mockResolvedValue(redis);

      mockVerify.mockReturnValue({ sub: 'user-different', role: 'CUSTOMER' });

      await expect(refreshTokens('user-1', 'old-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Refresh token does not match user',
      });
    });

    test('throws unauthorized if user is not found in database', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('old-refresh-token');
      mockGetRedisClient.mockResolvedValue(redis);

      mockVerify.mockReturnValue({ sub: 'user-1', role: 'CUSTOMER' });
      mockFindById.mockResolvedValue(null);

      await expect(refreshTokens('user-1', 'old-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'User not found or inactive',
      });
    });

    test('throws unauthorized if user is inactive/suspended', async () => {
      const redis = createRedisMock();
      redis.get.mockResolvedValue('old-refresh-token');
      mockGetRedisClient.mockResolvedValue(redis);

      mockVerify.mockReturnValue({ sub: 'user-1', role: 'CUSTOMER' });
      mockFindById.mockResolvedValue(createTestUser({ isActive: false }));

      await expect(refreshTokens('user-1', 'old-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'User not found or inactive',
      });
    });
  });

  describe('logout', () => {
    test('deletes the refresh token from Redis successfully', async () => {
      const redis = createRedisMock();
      redis.del.mockResolvedValue(1);
      mockGetRedisClient.mockResolvedValue(redis);

      await logout('user-1');

      expect(redis.del).toHaveBeenCalledWith('refresh:user-1');
    });
  });

  describe('getProfile', () => {
    test('returns cached profile from Redis on cache hit', async () => {
      const cachedProfile = {
        _id: 'user-1',
        email: 'user@example.com',
        role: 'CUSTOMER',
        isActive: true,
        savedAddresses: [],
        favouriteProductIds: [],
      };
      mockGetCache.mockResolvedValue(cachedProfile);

      const result = await getProfile('user-1');

      expect(mockGetCache).toHaveBeenCalledWith('user_profile:user-1');
      expect(mockFindById).not.toHaveBeenCalled();
      expect(result).toEqual(cachedProfile);
    });

    test('fetches profile from DB, caches it in Redis, and returns on cache miss', async () => {
      mockGetCache.mockResolvedValue(null);
      mockSetCache.mockResolvedValue(undefined);

      const dbUser = createTestUser();
      mockFindById.mockResolvedValue(dbUser);

      const result = await getProfile('user-1');

      expect(mockGetCache).toHaveBeenCalledWith('user_profile:user-1');
      expect(mockFindById).toHaveBeenCalledWith('user-1');
      expect(mockSetCache).toHaveBeenCalledWith(
        'user_profile:user-1',
        dbUser.toJSON(),
        300
      );
      expect(result).toEqual(dbUser.toJSON());
    });

    test('throws not found if user profile cache miss and user is not in database', async () => {
      mockGetCache.mockResolvedValue(null);
      mockFindById.mockResolvedValue(null);

      await expect(getProfile('user-1')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });

    test('throws not found if user profile cache miss and user is inactive', async () => {
      mockGetCache.mockResolvedValue(null);
      mockFindById.mockResolvedValue(createTestUser({ isActive: false }));

      await expect(getProfile('user-1')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('updateProfile', () => {
    test('updates name and phone, caches, and returns user profile', async () => {
      mockSetCache.mockResolvedValue(undefined);

      const updatedUser = createTestUser({ name: 'Jane Doe', phone: '9876543210' });
      mockFindOneAndUpdate.mockResolvedValue(updatedUser);

      const result = await updateProfile('user-1', { name: 'Jane Doe', phone: '9876543210' });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'user-1', isActive: true },
        { $set: { name: 'Jane Doe', phone: '9876543210' } },
        { new: true }
      );
      expect(mockSetCache).toHaveBeenCalledWith('user_profile:user-1', updatedUser.toJSON(), 300);
      expect(result).toEqual(updatedUser.toJSON());
    });

    test('throws not found if user does not exist or is inactive during update', async () => {
      mockFindOneAndUpdate.mockResolvedValue(null);

      await expect(updateProfile('user-1', { name: 'Jane Doe' })).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('addAddress', () => {
    test('adds structure address successfully and marks it default if first address', async () => {
      mockSetCache.mockResolvedValue(undefined);

      const dbUser = createTestUser({ savedAddresses: [] });
      mockFindOne.mockResolvedValue(dbUser);

      const addressData = {
        label: 'Home',
        street: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        isDefault: false,
      };

      const result = await addAddress('user-1', addressData);

      expect(mockFindOne).toHaveBeenCalledWith({ _id: 'user-1', isActive: true });
      expect(dbUser.save).toHaveBeenCalled();
      expect(dbUser.savedAddresses.length).toBe(1);
      expect(dbUser.savedAddresses[0].isDefault).toBe(true); // Forced true since it's the first
      expect(result).toBe(dbUser.savedAddresses);
    });

    test('unsets other defaults when adding a new default address', async () => {
      mockSetCache.mockResolvedValue(undefined);

      const existingAddress = { _id: 'addr-existing', label: 'Work', isDefault: true };
      const dbUser = createTestUser({ savedAddresses: [existingAddress] });
      mockFindOne.mockResolvedValue(dbUser);

      const addressData = {
        label: 'Home',
        street: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        isDefault: true,
      };

      await addAddress('user-1', addressData);

      expect(dbUser.savedAddresses[0].isDefault).toBe(false); // Former default is now false
      expect(dbUser.savedAddresses[1].isDefault).toBe(true);  // New default is true
    });

    test('throws not found if user is not found during address add', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(addAddress('user-1', {})).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('removeAddress', () => {
    test('removes address successfully and sets another as default if needed', async () => {
      mockSetCache.mockResolvedValue(undefined);

      const addr1 = { _id: 'addr-1', label: 'Home', isDefault: true };
      const addr2 = { _id: 'addr-2', label: 'Work', isDefault: false };
      const dbUser = createTestUser({ savedAddresses: [addr1, addr2] });
      mockFindOne.mockResolvedValue(dbUser);

      const result = await removeAddress('user-1', 'addr-1');

      expect(mockFindOne).toHaveBeenCalledWith({ _id: 'user-1', isActive: true });
      expect(dbUser.save).toHaveBeenCalled();
      expect(dbUser.savedAddresses.length).toBe(1);
      expect(dbUser.savedAddresses[0]._id).toBe('addr-2');
      expect(dbUser.savedAddresses[0].isDefault).toBe(true); // Promoted to default
      expect(result).toBe(dbUser.savedAddresses);
    });

    test('throws not found if target address to delete is not in user list', async () => {
      const dbUser = createTestUser({ savedAddresses: [] });
      mockFindOne.mockResolvedValue(dbUser);

      await expect(removeAddress('user-1', 'addr-nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Address not found',
      });
    });

    test('throws not found if user does not exist during address delete', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(removeAddress('user-1', 'addr-1')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('setDefaultAddress', () => {
    test('marks selected address default and unsets others', async () => {
      mockSetCache.mockResolvedValue(undefined);

      const addr1 = { _id: 'addr-1', label: 'Home', isDefault: true };
      const addr2 = { _id: 'addr-2', label: 'Work', isDefault: false };
      const dbUser = createTestUser({ savedAddresses: [addr1, addr2] });
      mockFindOne.mockResolvedValue(dbUser);

      const result = await setDefaultAddress('user-1', 'addr-2');

      expect(dbUser.save).toHaveBeenCalled();
      expect(dbUser.savedAddresses[0].isDefault).toBe(false);
      expect(dbUser.savedAddresses[1].isDefault).toBe(true);
      expect(result).toBe(dbUser.savedAddresses);
    });

    test('throws not found if target default address is not found', async () => {
      const dbUser = createTestUser({ savedAddresses: [] });
      mockFindOne.mockResolvedValue(dbUser);

      await expect(setDefaultAddress('user-1', 'addr-nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Address not found',
      });
    });
  });

  describe('toggleFavouriteProduct', () => {
    test('adds productId to favourites list if not present', async () => {
      mockSetCache.mockResolvedValue(undefined);

      const dbUser = createTestUser({ favouriteProductIds: [] });
      mockFindOne.mockResolvedValue(dbUser);

      const result = await toggleFavouriteProduct('user-1', 'prod-123');

      expect(dbUser.save).toHaveBeenCalled();
      expect(dbUser.favouriteProductIds.length).toBe(1);
      expect(dbUser.favouriteProductIds[0]).toBe('prod-123');
      expect(result).toBe(dbUser.favouriteProductIds);
    });

    test('removes productId from favourites list if already present', async () => {
      mockSetCache.mockResolvedValue(undefined);

      const dbUser = createTestUser({ favouriteProductIds: ['prod-123'] });
      mockFindOne.mockResolvedValue(dbUser);

      const result = await toggleFavouriteProduct('user-1', 'prod-123');

      expect(dbUser.save).toHaveBeenCalled();
      expect(dbUser.favouriteProductIds.length).toBe(0);
      expect(result).toBe(dbUser.favouriteProductIds);
    });

    test('throws not found if user does not exist during favourite toggle', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(toggleFavouriteProduct('user-1', 'prod-123')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });
});
