const { login, signup, processSOS, getAdminData, addContact } = require('../controllers/authController');
const { dbState, MEMORY_USERS, MEMORY_LOGS } = require('../models/Database'); 

// 🚀 THE FIX: Mock external network calls so tests run instantly (No Timeouts!)
jest.mock('nodemailer', () => ({
    createTestAccount: jest.fn().mockResolvedValue({ user: 'test', pass: 'test' }),
    createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn().mockResolvedValue({ messageId: '123' }) }),
    getTestMessageUrl: jest.fn().mockReturnValue('http://mock.com')
}));
jest.mock('twilio', () => jest.fn().mockImplementation(() => ({
    messages: { create: jest.fn().mockResolvedValue({ sid: '123' }) }
})));

describe('Maximum Mutation Coverage Suite', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        dbState.isMongoConnected = false; 
        MEMORY_USERS.length = 0; 
        MEMORY_LOGS.length = 0;
    });

    // ==========================================
    // 1. LOGIN TESTS
    // ==========================================
    describe('Login Controller', () => {
        it('kills mutants: authenticates Admin', async () => {
            req.body = { email: "admin@sos.com", password: "admin" };
            await login(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
        });

        it('kills mutants: authenticates normal user', async () => {
            MEMORY_USERS.push({ name: "User", email: "user@sos.com", password: "123", status: "active", contacts: [] });
            req.body = { email: "user@sos.com", password: "123" };
            await login(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, role: 'user' }));
        });

        it('kills mutants: blocks bad credentials', async () => {
            req.body = { email: "fake@sos.com", password: "wrong" };
            await login(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('kills mutants: blocks suspended accounts', async () => {
            MEMORY_USERS.push({ email: "bad@sos.com", password: "123", status: "blocked" });
            req.body = { email: "bad@sos.com", password: "123" };
            await login(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    // ==========================================
    // 2. SIGNUP TESTS 
    // ==========================================
    describe('Signup Controller', () => {
        it('kills mutants: rejects missing fields', async () => {
            req.body = { email: "incomplete@sos.com" }; 
            await signup(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Missing required fields" }));
        });

        it('kills mutants: registers new user', async () => {
            req.body = { name: "Test", email: "new@sos.com", password: "123" };
            await signup(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('kills mutants: rejects duplicates', async () => {
            MEMORY_USERS.push({ email: "dup@sos.com", password: "old" });
            req.body = { name: "Imp", email: "dup@sos.com", password: "new" };
            await signup(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "User exists" }));
        });
    });

    // ==========================================
    // 3. SOS DISPATCH TESTS
    // ==========================================
    describe('processSOS Controller', () => {
        it('kills mutants: processes Guest SOS', async () => {
            req.body = { user: null, location: { lat: 28.7, lng: 77.1 } };
            await processSOS(req, res);
            expect(MEMORY_LOGS.length).toBe(1);
            expect(MEMORY_LOGS[0].triggerType).toBe('Guest');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('kills mutants: processes Logged-in User SOS', async () => {
            req.body = { user: { name: "Aayush", email: "a@sos.com" }, location: { lat: 28.7, lng: 77.1 } };
            await processSOS(req, res);
            expect(MEMORY_LOGS.length).toBe(1);
            expect(MEMORY_LOGS[0].triggerType).toBe('Registered User'); // 🚀 THE FIX FOR THE MISMATCH
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    // ==========================================
    // 4. ADMIN & CONTACT TESTS 
    // ==========================================
    describe('Utility Controllers', () => {
        it('kills mutants: retrieves Admin Data', async () => {
            await getAdminData(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ users: expect.any(Array), logs: expect.any(Array) }));
        });

        it('kills mutants: adds contact to existing user', async () => {
            MEMORY_USERS.push({ email: "user@sos.com", contacts: [] });
            req.body = { email: "user@sos.com", contactName: "Mom", contactPhone: "999" };
            await addContact(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('kills mutants: fails contact add if user not found', async () => {
            req.body = { email: "ghost@sos.com", contactName: "Mom", contactPhone: "999" };
            await addContact(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});