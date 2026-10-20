const request = require('supertest');
const app = require('../server');
const {
  SUPPORTED_CURRENCY_CODES,
  DEFAULT_CURRENCY,
  isSupportedCurrency,
  normalizeCurrency
} = require('../constants/currencies');

describe('currency constants', () => {
  it('accepts supported codes case-insensitively and trims whitespace', () => {
    expect(isSupportedCurrency('INR')).toBe(true);
    expect(isSupportedCurrency(' inr ')).toBe(true);
  });

  it('rejects unsupported or non-string values', () => {
    ['ZZZ', '', 'US', 'DOLLAR', null, undefined, 123, {}, []].forEach((value) => {
      expect(isSupportedCurrency(value)).toBe(false);
    });
  });

  it('normalizeCurrency upper-cases valid codes and falls back otherwise', () => {
    expect(normalizeCurrency('eur')).toBe('EUR');
    expect(normalizeCurrency('nope')).toBe(DEFAULT_CURRENCY);
    expect(normalizeCurrency(undefined, 'INR')).toBe('INR');
  });

  it('keeps the legacy currencies the app already stored', () => {
    ['USD', 'EUR', 'GBP', 'INR'].forEach((code) => {
      expect(SUPPORTED_CURRENCY_CODES).toContain(code);
    });
  });

  it('has no duplicate codes', () => {
    expect(new Set(SUPPORTED_CURRENCY_CODES).size).toBe(SUPPORTED_CURRENCY_CODES.length);
  });
});

describe('currency in auth flow', () => {
  const baseUser = {
    studentId: 'STU777',
    fullName: 'Currency User',
    email: 'currency@example.com',
    password: 'Password123!',
    department: 'Computer Science',
    year: '3rd'
  };

  it('stores the currency chosen at registration (normalised to upper case)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...baseUser, currency: 'inr' });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.currency).toBe('INR');
  });

  it('defaults to USD when no currency is sent at registration', async () => {
    const res = await request(app).post('/api/auth/register').send(baseUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.currency).toBe('USD');
  });

  it('rejects an unsupported currency at registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...baseUser, currency: 'XXX' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'currency' })])
    );
  });

  it('updates currency via PUT /api/auth/profile and rejects invalid codes', async () => {
    const reg = await request(app).post('/api/auth/register').send(baseUser);
    const token = reg.body.token;

    const ok = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ currency: 'JPY' });
    expect(ok.statusCode).toBe(200);
    expect(ok.body.user.currency).toBe('JPY');

    const bad = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ currency: 'NOT-A-CURRENCY' });
    expect(bad.statusCode).toBe(400);
  });
});
