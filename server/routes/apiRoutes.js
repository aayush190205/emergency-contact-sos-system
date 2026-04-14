const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/contacts', authController.addContact);
router.post('/sos', authController.processSOS);

router.get('/admin-data', authController.getAdminData);
router.post('/admin/delete-user', authController.deleteUser);

module.exports = router;