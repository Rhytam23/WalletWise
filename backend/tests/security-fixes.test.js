const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transactions');
const SavingsGoal = require('../models/SavingGoal');

let counter = 0;
const registerUser = async (overrides = {}) => {
    counter += 1;
    const data = {
        studentId: `SEC${Date.now()}${counter}`,
        fullName: 'Security Test',
        email: `sec${Date.now()}${counter}@example.com`,
        password: 'Password123!',
        department: 'CS',
        year: '3rd',
        ...overrides
    };
    const res = await request(app).post('/api/v1/auth/register').send(data);
    return { res, data, token: res.body.token };
};

describe('Password policy', () => {
    it.each([
        ['too short', 'Ab1!'],
        ['no uppercase', 'password123!'],
        ['no number', 'Password!!!'],
        ['no special character', 'Password123']
    ])('rejects a password with %s', async (_label, password) => {
        const { res } = await registerUser({ password });
        expect(res.statusCode).toBe(400);
    });

    it('accepts a strong password', async () => {
        const { res } = await registerUser();
        expect(res.statusCode).toBe(201);
    });
});

describe('Auth middleware', () => {
    it('rejects a valid token once the user has been deleted', async () => {
        const { token, data } = await registerUser();
        await User.deleteOne({ email: data.email });

        const res = await request(app)
            .get('/api/v1/transactions')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(401);
    });
});

describe('Wallet access control', () => {
    it('does not let a non-member list another wallet transactions', async () => {
        const owner = await registerUser();
        const attacker = await registerUser();
        const ownerDoc = await User.findOne({ email: owner.data.email });

        const wallet = await Wallet.create({
            name: 'Private',
            owner: ownerDoc._id,
            members: [{ user: ownerDoc._id, role: 'admin' }]
        });

        const res = await request(app)
            .get(`/api/v1/transactions?walletId=${wallet._id}`)
            .set('Authorization', `Bearer ${attacker.token}`);
        expect(res.statusCode).toBe(403);

        const ok = await request(app)
            .get(`/api/v1/transactions?walletId=${wallet._id}`)
            .set('Authorization', `Bearer ${owner.token}`);
        expect(ok.statusCode).toBe(200);
    });
});

describe('Delete + undo transaction', () => {
    const addTx = (token, body = {}) => request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'expense', amount: 200, category: 'food', description: 'lunch', ...body });

    it('restores the exact original from the server-side snapshot', async () => {
        const { token, data } = await registerUser();
        const created = await addTx(token, { paymentMethod: 'upi', mood: 'happy' });
        expect(created.statusCode).toBe(201);
        const id = created.body.transaction._id;

        const balanceAfterAdd = (await User.findOne({ email: data.email })).walletBalance;

        await request(app).delete(`/api/v1/transactions/${id}`).set('Authorization', `Bearer ${token}`).expect(200);
        expect((await User.findOne({ email: data.email })).walletBalance).toBe(balanceAfterAdd + 200);

        const undo = await request(app)
            .post(`/api/v1/transactions/${id}/undo`)
            // client-supplied data must be ignored
            .send({ deletedTransaction: { type: 'income', amount: 999999, category: 'salary' } })
            .set('Authorization', `Bearer ${token}`);
        expect(undo.statusCode).toBe(200);

        const restored = await Transaction.findById(id);
        expect(restored).not.toBeNull();
        expect(restored.amount).toBe(200);
        expect(restored.type).toBe('expense');
        expect(restored.paymentMethod).toBe('upi');
        expect(restored.mood).toBe('happy');
        expect((await User.findOne({ email: data.email })).walletBalance).toBe(balanceAfterAdd);
    });

    it('cannot be used to mint money without a real deletion, or twice', async () => {
        const { token } = await registerUser();
        const fake = new mongoose.Types.ObjectId();
        const forged = await request(app)
            .post(`/api/v1/transactions/${fake}/undo`)
            .send({ deletedTransaction: { type: 'income', amount: 1000000, category: 'salary' } })
            .set('Authorization', `Bearer ${token}`);
        expect(forged.statusCode).toBe(404);

        const created = await addTx(token);
        const id = created.body.transaction._id;
        await request(app).delete(`/api/v1/transactions/${id}`).set('Authorization', `Bearer ${token}`).expect(200);
        await request(app).post(`/api/v1/transactions/${id}/undo`).set('Authorization', `Bearer ${token}`).expect(200);
        await request(app).post(`/api/v1/transactions/${id}/undo`).set('Authorization', `Bearer ${token}`).expect(404);
    });

    it('does not let another user undo a deletion that is not theirs', async () => {
        const a = await registerUser();
        const b = await registerUser();
        const created = await addTx(a.token);
        const id = created.body.transaction._id;
        await request(app).delete(`/api/v1/transactions/${id}`).set('Authorization', `Bearer ${a.token}`).expect(200);
        await request(app).post(`/api/v1/transactions/${id}/undo`).set('Authorization', `Bearer ${b.token}`).expect(404);
    });

    it('restores a shared-wallet transaction to its wallet, not the personal balance', async () => {
        const { token, data } = await registerUser();
        const user = await User.findOne({ email: data.email });
        const wallet = await Wallet.create({
            name: 'Trip',
            owner: user._id,
            balance: 5000,
            members: [{ user: user._id, role: 'admin' }]
        });

        const created = await addTx(token, { amount: 300, walletId: String(wallet._id) });
        expect(created.statusCode).toBe(201);
        const id = created.body.transaction._id;
        expect((await Wallet.findById(wallet._id)).balance).toBe(4700);
        const personalBefore = (await User.findById(user._id)).walletBalance;

        await request(app).delete(`/api/v1/transactions/${id}`).set('Authorization', `Bearer ${token}`).expect(200);
        expect((await Wallet.findById(wallet._id)).balance).toBe(5000);

        await request(app).post(`/api/v1/transactions/${id}/undo`).set('Authorization', `Bearer ${token}`).expect(200);
        expect((await Wallet.findById(wallet._id)).balance).toBe(4700);
        expect((await User.findById(user._id)).walletBalance).toBe(personalBefore);
        expect(String((await Transaction.findById(id)).walletId)).toBe(String(wallet._id));
    });
});

describe('Savings goal contributions', () => {
    const createGoal = (token, targetAmount = 1000) => request(app)
        .post('/api/v1/savings-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'Goal',
            targetAmount,
            targetDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString()
        });

    it('does not lose updates under concurrent contributions and debits the wallet', async () => {
        const { token, data } = await registerUser();
        await User.updateOne({ email: data.email }, { walletBalance: 1000 });
        const goal = await createGoal(token, 10000);
        const goalId = goal.body.goal.id;

        await Promise.all(Array.from({ length: 10 }, () =>
            request(app)
                .post(`/api/v1/savings-goals/${goalId}/add`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 50 })
        ));

        const stored = await SavingsGoal.findById(goalId);
        expect(stored.currentAmount).toBe(500);
        expect(stored.progress).toBeCloseTo(5);
        expect((await User.findOne({ email: data.email })).walletBalance).toBe(500);
    });

    it('caps at the target and only debits what was applied', async () => {
        const { token, data } = await registerUser();
        await User.updateOne({ email: data.email }, { walletBalance: 1000 });
        const goal = await createGoal(token, 100);

        const res = await request(app)
            .post(`/api/v1/savings-goals/${goal.body.goal.id}/add`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 400 });
        expect(res.statusCode).toBe(200);
        expect(res.body.goal.currentAmount).toBe(100);
        expect((await User.findOne({ email: data.email })).walletBalance).toBe(900);
    });
});

describe('Budget update validation', () => {
    it('rejects categories with a missing amount or percentage (NaN bypass)', async () => {
        const { token } = await registerUser();
        const month = new Date().toISOString().slice(0, 7);
        const created = await request(app)
            .post('/api/v1/budget')
            .set('Authorization', `Bearer ${token}`)
            .send({
                totalBudget: 1000,
                month,
                categories: [{ name: 'food', amount: 1000, percentage: 100 }]
            });
        expect(created.statusCode).toBeLessThan(300);
        const id = created.body.budget?._id || created.body.budget?.id;

        const res = await request(app)
            .put(`/api/v1/budget/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ categories: [{ name: 'food', amount: 1000 }] });
        expect(res.statusCode).toBe(400);
    });
});
