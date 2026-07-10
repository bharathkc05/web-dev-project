import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreateProduct = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockAggregateProduct = jest.fn();

const mockFindOneOffer = jest.fn();
const mockCreateOffer = jest.fn();

const mockFindOneReview = jest.fn();
const mockCreateReview = jest.fn();
const mockAggregateReview = jest.fn();

const mockFindOneOrder = jest.fn();

const mockUploadImage = jest.fn();
const mockDeleteImage = jest.fn();

const mockGetCache = jest.fn();
const mockSetCache = jest.fn();
const mockDeleteCache = jest.fn();
const mockDeleteCachePattern = jest.fn();

// Mock Mongoose models
jest.unstable_mockModule('../../src/modules/products/product.model.js', () => ({
  Product: {
    find: mockFind,
    findById: mockFindById,
    create: mockCreateProduct,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
    aggregate: mockAggregateProduct,
  },
  Offer: {
    findOne: mockFindOneOffer,
    create: mockCreateOffer,
  },
  Review: {
    findOne: mockFindOneReview,
    create: mockCreateReview,
    aggregate: mockAggregateReview,
  },
}));

jest.unstable_mockModule('../../src/shared/models/order.model.js', () => ({
  default: {
    findOne: mockFindOneOrder,
  },
}));

jest.unstable_mockModule('../../src/shared/utils/cloudinary.js', () => ({
  uploadImage: mockUploadImage,
  deleteImage: mockDeleteImage,
  default: {
    uploadImage: mockUploadImage,
    deleteImage: mockDeleteImage,
  },
}));

jest.unstable_mockModule('../../src/shared/utils/cacheHelper.js', () => ({
  getCache: mockGetCache,
  setCache: mockSetCache,
  deleteCache: mockDeleteCache,
  deleteCachePattern: mockDeleteCachePattern,
}));

const {
  getAllProducts,
  getProductById,
  activateProduct,
  updateOutletProduct,
  softDeleteProduct,
  getPopularProducts,
  submitReview,
  createOffer,
  validateOffer,
} = await import('../../src/modules/products/product.service.js');

// Valid 24-character hex MongoDB ObjectIds for testing
const MOCK_OUTLET_ID = '60c72b2f9b1d8a2c148b4567';
const MOCK_PRODUCT_ID = '60c72b2f9b1d8a2c148b4568';
const MOCK_USER_ID = '60c72b2f9b1d8a2c148b4569';
const MOCK_ORDER_ID = '60c72b2f9b1d8a2c148b456a';

const createTestProduct = (overrides = {}) => ({
  _id: MOCK_PRODUCT_ID,
  outletId: MOCK_OUTLET_ID,
  name: 'Cheeseburger',
  description: 'Classic cheeseburger',
  imageUrl: 'https://cloudinary.com/cheeseburger.jpg',
  price: 9.99,
  isAvailable: true,
  ratings: { avg: 4.5, count: 10 },
  toJSON() {
    const { toJSON, ...rest } = this;
    return rest;
  },
  ...overrides,
});

describe('product.service unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    test('returns cached products from Redis on cache hit', async () => {
      const cachedResult = {
        items: [createTestProduct().toJSON()],
        pageInfo: { nextCursor: null, hasNextPage: false, limit: 20 },
      };
      mockGetCache.mockResolvedValue(cachedResult);

      const result = await getAllProducts({ outletId: MOCK_OUTLET_ID });

      expect(mockGetCache).toHaveBeenCalledWith(`products:${MOCK_OUTLET_ID}:all:avail:start:20`);
      expect(mockFind).not.toHaveBeenCalled();
      expect(result).toEqual(cachedResult);
    });

    test('queries DB, caches, and returns products on cache miss', async () => {
      mockGetCache.mockResolvedValue(null);
      mockSetCache.mockResolvedValue(undefined);

      const dbProduct = createTestProduct().toJSON();
      mockAggregateProduct.mockResolvedValue([dbProduct]);

      const result = await getAllProducts({ outletId: MOCK_OUTLET_ID });

      expect(mockGetCache).toHaveBeenCalledWith(`products:${MOCK_OUTLET_ID}:all:avail:start:20`);
      expect(mockAggregateProduct).toHaveBeenCalled();
      expect(mockSetCache).toHaveBeenCalledWith(
        `products:${MOCK_OUTLET_ID}:all:avail:start:20`,
        {
          items: [dbProduct],
          pageInfo: { nextCursor: null, hasNextPage: false, limit: 20 },
        },
        300
      );
      expect(result.items[0]._id).toBe(MOCK_PRODUCT_ID);
    });
  });

  describe('getProductById', () => {
    test('returns cached product details on cache hit', async () => {
      const cachedProduct = createTestProduct().toJSON();
      mockGetCache.mockResolvedValue(cachedProduct);

      const result = await getProductById(MOCK_PRODUCT_ID);

      expect(mockGetCache).toHaveBeenCalledWith(`product:${MOCK_PRODUCT_ID}`);
      expect(mockFindById).not.toHaveBeenCalled();
      expect(result).toEqual(cachedProduct);
    });

    test('fetches from DB, caches, and returns product on cache miss', async () => {
      mockGetCache.mockResolvedValue(null);
      mockSetCache.mockResolvedValue(undefined);

      const dbProduct = createTestProduct().toJSON();
      mockAggregateProduct.mockResolvedValue([dbProduct]);

      const result = await getProductById(MOCK_PRODUCT_ID);

      expect(mockGetCache).toHaveBeenCalledWith(`product:${MOCK_PRODUCT_ID}`);
      expect(mockAggregateProduct).toHaveBeenCalled();
      expect(mockSetCache).toHaveBeenCalledWith(`product:${MOCK_PRODUCT_ID}`, dbProduct, 3600);
      expect(result).toEqual(dbProduct);
    });

    test('throws not found error if product is missing in DB', async () => {
      mockGetCache.mockResolvedValue(null);

      mockAggregateProduct.mockResolvedValue([]);

      await expect(getProductById('60c72b2f9b1d8a2c148b456e')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Product not found',
      });
    });
  });

  describe('activateProduct', () => {
    test('activates a master product for an outlet and invalidates Redis list cache', async () => {
      mockDeleteCachePattern.mockResolvedValue(undefined);

      const newProduct = createTestProduct();
      mockCreateProduct.mockResolvedValue(newProduct);

      const productData = {
        outletId: MOCK_OUTLET_ID,
        masterProductId: '60c72b2f9b1d8a2c148b4500',
        price: 12.99,
      };

      const result = await activateProduct(productData);

      expect(mockCreateProduct).toHaveBeenCalledWith({
        ...productData,
        isAvailable: true,
      });
      expect(mockDeleteCachePattern).toHaveBeenCalledWith('products:*');
      expect(mockDeleteCache).toHaveBeenCalledWith('popular_products');
      expect(result).toEqual(newProduct.toJSON());
    });
  });

  describe('updateOutletProduct', () => {
    test('updates product successfully for outlet manager owner', async () => {
      mockDeleteCache.mockResolvedValue(undefined);
      mockDeleteCachePattern.mockResolvedValue(undefined);

      const existingProduct = createTestProduct({ outletId: MOCK_OUTLET_ID });
      mockFindById.mockResolvedValue(existingProduct);

      const updatedProduct = createTestProduct({ name: 'Cheeseburger Deluxe' }).toJSON();
      mockFindByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updatedProduct),
      });

      const user = { role: 'OUTLET_MANAGER', outletId: MOCK_OUTLET_ID };
      const result = await updateOutletProduct(MOCK_PRODUCT_ID, { price: 15.99 }, user);

      expect(mockFindById).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        MOCK_PRODUCT_ID,
        { $set: { price: 15.99 } },
        { new: true }
      );
      expect(mockDeleteCache).toHaveBeenCalledWith(`product:${MOCK_PRODUCT_ID}`);
      expect(mockDeleteCachePattern).toHaveBeenCalledWith('products:*');
      expect(result).toEqual(updatedProduct);
    });

    test('throws forbidden error if outlet manager does not own the product outlet', async () => {
      const existingProduct = createTestProduct({ outletId: '60c72b2f9b1d8a2c148b456f' });
      mockFindById.mockResolvedValue(existingProduct);

      const user = { role: 'OUTLET_MANAGER', outletId: MOCK_OUTLET_ID };
      
      await expect(updateOutletProduct(MOCK_PRODUCT_ID, { price: 15.99 }, user)).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to modify this product',
      });

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteProduct', () => {
    test('soft deletes product by marking isAvailable false', async () => {
      mockDeleteCache.mockResolvedValue(undefined);
      mockDeleteCachePattern.mockResolvedValue(undefined);

      const existingProduct = createTestProduct({ outletId: MOCK_OUTLET_ID });
      mockFindById.mockResolvedValue(existingProduct);

      const deletedProduct = createTestProduct({ isAvailable: false }).toJSON();
      mockFindByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(deletedProduct),
      });

      const user = { role: 'OUTLET_MANAGER', outletId: MOCK_OUTLET_ID };
      const result = await softDeleteProduct(MOCK_PRODUCT_ID, user);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(result.isAvailable).toBe(false);
    });
  });

  describe('getPopularProducts', () => {
    test('returns cached popular list on hit', async () => {
      const cached = [createTestProduct().toJSON()];
      mockGetCache.mockResolvedValue(cached);

      const result = await getPopularProducts();

      expect(mockGetCache).toHaveBeenCalledWith('popular_products');
      expect(mockAggregateReview).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });
  });

  describe('submitReview', () => {
    test('submits review successfully, recalculates rating stats, and invalidates cache', async () => {
      mockDeleteCache.mockResolvedValue(undefined);
      mockDeleteCachePattern.mockResolvedValue(undefined);

      const product = createTestProduct({ outletId: MOCK_OUTLET_ID });
      mockFindById.mockResolvedValue(product);

      mockFindOneOrder.mockResolvedValue({ _id: MOCK_ORDER_ID, orderStatus: 'DELIVERED' });
      mockFindOneReview.mockResolvedValue(null); // No duplicate reviews
      
      const newReview = { _id: 'rev-1', rating: 5, comment: 'Nice!' };
      mockCreateReview.mockReturnValue({
        toJSON: () => newReview,
      });

      mockAggregateReview.mockResolvedValue([{ _id: null, avgRating: 4.8, count: 12 }]);

      const result = await submitReview(MOCK_PRODUCT_ID, MOCK_USER_ID, MOCK_ORDER_ID, { rating: 5, comment: 'Nice!' });

      expect(mockFindOneOrder).toHaveBeenCalledWith({ _id: MOCK_ORDER_ID, userId: MOCK_USER_ID });
      expect(mockFindOneReview).toHaveBeenCalledWith({ orderId: MOCK_ORDER_ID, productId: MOCK_PRODUCT_ID });
      expect(mockCreateReview).toHaveBeenCalledWith({
        userId: MOCK_USER_ID,
        productId: MOCK_PRODUCT_ID,
        orderId: MOCK_ORDER_ID,
        rating: 5,
        comment: 'Nice!',
      });
      expect(mockAggregateReview).toHaveBeenCalled();
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(MOCK_PRODUCT_ID, {
        $set: { 'ratings.avg': 4.8, 'ratings.count': 12 },
      });
      expect(result).toEqual(newReview);
    });

    test('throws bad request if order is not delivered yet', async () => {
      mockFindById.mockResolvedValue(createTestProduct());
      mockFindOneOrder.mockResolvedValue({ _id: MOCK_ORDER_ID, orderStatus: 'PLACED' });

      await expect(submitReview(MOCK_PRODUCT_ID, MOCK_USER_ID, MOCK_ORDER_ID, { rating: 5 })).rejects.toMatchObject({
        statusCode: 400,
        message: 'You can only review products from delivered orders',
      });
    });
  });

  describe('createOffer', () => {
    test('creates a new offer code successfully', async () => {
      mockFindOneOffer.mockResolvedValue(null); // Code not in use
      
      const newOffer = { _id: 'offer-1', code: 'PROMO10', value: 10 };
      mockCreateOffer.mockReturnValue({
        toJSON: () => newOffer,
      });

      const result = await createOffer(MOCK_OUTLET_ID, { code: 'PROMO10', type: 'FLAT', value: 10, usageLimit: 100, expiryDate: new Date() });

      expect(mockFindOneOffer).toHaveBeenCalledWith({ outletId: MOCK_OUTLET_ID, code: 'PROMO10' });
      expect(mockCreateOffer).toHaveBeenCalled();
      expect(result).toEqual(newOffer);
    });
  });

  describe('validateOffer', () => {
    test('validates and returns offer details successfully', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 5); // 5 days in the future

      const offer = {
        code: 'PROMO10',
        outletId: MOCK_OUTLET_ID,
        expiryDate,
        usageLimit: 100,
        usedCount: 50,
        minOrderValue: 20,
        toJSON: () => ({ code: 'PROMO10' }),
      };
      mockFindOneOffer.mockResolvedValue(offer);

      const result = await validateOffer('PROMO10', MOCK_OUTLET_ID, 25);

      expect(mockFindOneOffer).toHaveBeenCalledWith({ outletId: MOCK_OUTLET_ID, code: 'PROMO10' });
      expect(result).toEqual({ code: 'PROMO10' });
    });

    test('throws error if offer code has expired', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - 1); // 1 day in the past

      const offer = {
        code: 'PROMO10',
        outletId: MOCK_OUTLET_ID,
        expiryDate,
        usageLimit: 100,
        usedCount: 50,
        minOrderValue: 20,
      };
      mockFindOneOffer.mockResolvedValue(offer);

      await expect(validateOffer('PROMO10', MOCK_OUTLET_ID, 25)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Offer has expired',
      });
    });

    test('throws error if subtotal does not meet min order value', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 5);

      const offer = {
        code: 'PROMO10',
        outletId: MOCK_OUTLET_ID,
        expiryDate,
        usageLimit: 100,
        usedCount: 50,
        minOrderValue: 50,
      };
      mockFindOneOffer.mockResolvedValue(offer);

      await expect(validateOffer('PROMO10', MOCK_OUTLET_ID, 25)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Minimum order value of $50 is required to use this offer',
      });
    });
  });
});
