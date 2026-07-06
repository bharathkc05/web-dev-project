import { jest } from '@jest/globals';

const mockFindOne = jest.fn();

jest.unstable_mockModule('../../src/modules/products/product.model.js', () => ({
  Offer: {
    findOne: mockFindOne,
  },
}));

const { validateOffer, calculateDiscount } = await import('../../src/modules/products/offer.service.js');

const MOCK_OUTLET_ID = '60c72b2f9b1d8a2c148b4567';

const createTestOffer = (overrides = {}) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 5); // Default: future expiry

  return {
    _id: 'offer-1',
    outletId: MOCK_OUTLET_ID,
    code: 'PROMO10',
    type: 'FLAT',
    value: 10,
    minOrderValue: 0,
    expiryDate,
    usageLimit: 100,
    usedCount: 0,
    maxDiscount: null,
    toJSON() {
      const { toJSON, ...rest } = this;
      return rest;
    },
    ...overrides,
  };
};

describe('offer.service unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateOffer', () => {
    test('successfully validates a valid offer', async () => {
      const offer = createTestOffer({ minOrderValue: 50 });
      mockFindOne.mockResolvedValue(offer);

      const result = await validateOffer('PROMO10', MOCK_OUTLET_ID, 100);

      expect(mockFindOne).toHaveBeenCalledWith({ outletId: MOCK_OUTLET_ID, code: 'PROMO10' });
      expect(result).toEqual(offer.toJSON());
    });

    test('throws expired error if expiryDate is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // yesterday
      
      const offer = createTestOffer({ expiryDate: pastDate });
      mockFindOne.mockResolvedValue(offer);

      await expect(validateOffer('PROMO10', MOCK_OUTLET_ID, 100)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Offer has expired',
      });
    });

    test('throws usage limit error if usedCount matches or exceeds usageLimit', async () => {
      const offer = createTestOffer({ usageLimit: 10, usedCount: 10 });
      mockFindOne.mockResolvedValue(offer);

      await expect(validateOffer('PROMO10', MOCK_OUTLET_ID, 100)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Offer usage limit reached',
      });
    });

    test('throws minimum order value required error if subtotal is below minOrderValue', async () => {
      const offer = createTestOffer({ minOrderValue: 150 });
      mockFindOne.mockResolvedValue(offer);

      await expect(validateOffer('PROMO10', MOCK_OUTLET_ID, 100)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Minimum order value of $150 is required to use this offer',
      });
    });

    test('throws not found if offer does not exist', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(validateOffer('INVALID', MOCK_OUTLET_ID, 100)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Offer code not found for this outlet',
      });
    });
  });

  describe('calculateDiscount', () => {
    describe('FLAT discount type', () => {
      test('returns full discount value if subtotal is greater', () => {
        const offer = { type: 'FLAT', value: 50 };
        const result = calculateDiscount(offer, [], 100);
        expect(result).toBe(50);
      });

      test('caps discount at subtotal if value is greater than subtotal', () => {
        const offer = { type: 'FLAT', value: 50 };
        const result = calculateDiscount(offer, [], 30);
        expect(result).toBe(30);
      });
    });

    describe('PERCENT discount type', () => {
      test('calculates percentage discount accurately without cap', () => {
        const offer = { type: 'PERCENT', value: 20, maxDiscount: null };
        const result = calculateDiscount(offer, [], 150);
        expect(result).toBe(30); // 20% of 150
      });

      test('applies maximum discount cap if exceeded', () => {
        const offer = { type: 'PERCENT', value: 20, maxDiscount: 15 };
        const result = calculateDiscount(offer, [], 150);
        expect(result).toBe(15); // 20% of 150 is 30, capped at 15
      });

      test('caps calculated percent discount at subtotal', () => {
        const offer = { type: 'PERCENT', value: 120, maxDiscount: null }; // 120% discount (theoretical)
        const result = calculateDiscount(offer, [], 50);
        expect(result).toBe(50);
      });
    });

    describe('BOGO discount type', () => {
      test('returns 0 if total quantity in items list is less than 2', () => {
        const offer = { type: 'BOGO' };
        const items = [{ price: 10, qty: 1 }];
        const result = calculateDiscount(offer, items, 10);
        expect(result).toBe(0);
      });

      test('makes the cheaper item free for 2 distinct items', () => {
        const offer = { type: 'BOGO' };
        const items = [
          { price: 10, qty: 1 },
          { price: 6, qty: 1 }
        ];
        const result = calculateDiscount(offer, items, 16);
        expect(result).toBe(6);
      });

      test('makes one item free for 1 item of quantity 2', () => {
        const offer = { type: 'BOGO' };
        const items = [{ price: 10, qty: 2 }];
        const result = calculateDiscount(offer, items, 20);
        expect(result).toBe(10);
      });

      test('makes the single cheapest item free for 3 items (1 pair + 1 leftover)', () => {
        const offer = { type: 'BOGO' };
        const items = [
          { price: 10, qty: 1 },
          { price: 8, qty: 1 },
          { price: 5, qty: 1 }
        ];
        const result = calculateDiscount(offer, items, 23);
        expect(result).toBe(5);
      });

      test('makes the two cheapest items free for 4 items (2 pairs)', () => {
        const offer = { type: 'BOGO' };
        const items = [
          { price: 10, qty: 2 }, // two $10 items
          { price: 5, qty: 2 }   // two $5 items
        ];
        // Flat prices: 5, 5, 10, 10
        // Free count: 2 (2 pairs) -> Cheapest two (5 + 5) are free
        const result = calculateDiscount(offer, items, 30);
        expect(result).toBe(10);
      });
    });
  });
});
