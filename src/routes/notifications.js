const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const auth = require('../middleware/auth');

// Apply auth to all routes in this file
router.use(auth);

// @route   GET /api/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json({ success: true, data: notifications });
    } catch (err) {
        console.error('Fetch notifications error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ success: true, data: notification });
    } catch (err) {
        console.error('Update notification error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * Utility function to create a notification
 * @param {Object} data 
 * @param {string} data.userId 
 * @param {string} data.title 
 * @param {string} data.message 
 * @param {string} data.type 
 */
const createNotification = async (data) => {
    try {
        const notification = await Notification.create(data);
        return notification;
    } catch (err) {
        console.error('Create notification utility error', err);
        return null;
    }
};

module.exports = {
    router,
    createNotification
};
