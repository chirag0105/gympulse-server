const express = require('express');
const router = express.Router();
const { User, PtClient, Workout, WorkoutLog } = require('../models');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Apply auth and super_admin guard to all routes in this file
router.use(auth, roleGuard(['super_admin']));

// @route   GET /api/admin/users
// @desc    Get all users (PTs and clients) with basic stats
// @access  Private (Super Admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                role: ['pt', 'client']
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
            include: [
                {
                    model: PtClient,
                    as: 'clients', // When user is PT
                    attributes: ['id']
                },
                {
                    model: Workout,
                    as: 'workouts', // When user is PT
                    attributes: ['id']
                },
                {
                    model: WorkoutLog,
                    as: 'workoutLogs', // When user is client
                    attributes: ['id']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Map data to create simple stats
        const formattedUsers = users.map(user => {
            const jsonUser = user.toJSON();
            let stats = {};
            if (jsonUser.role === 'pt') {
                stats.clientCount = jsonUser.clients ? jsonUser.clients.length : 0;
                stats.workoutCount = jsonUser.workouts ? jsonUser.workouts.length : 0;
            } else if (jsonUser.role === 'client') {
                stats.logCount = jsonUser.workoutLogs ? jsonUser.workoutLogs.length : 0;
            }

            // Cleanup includes to keep response clean
            delete jsonUser.clients;
            delete jsonUser.workouts;
            delete jsonUser.workoutLogs;

            return {
                ...jsonUser,
                stats
            };
        });

        res.json({ success: true, count: formattedUsers.length, data: formattedUsers });
    } catch (err) {
        console.error('Fetch users error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle a user's active status
// @access  Private (Super Admin)
router.put('/users/:id/toggle-status', async (req, res) => {
    try {
        const userToUpdate = await User.findByPk(req.params.id);

        if (!userToUpdate) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (userToUpdate.role === 'super_admin') {
            return res.status(400).json({ success: false, message: 'Cannot modify super admin status' });
        }

        userToUpdate.isActive = !userToUpdate.isActive;
        await userToUpdate.save();

        res.json({ success: true, data: { id: userToUpdate.id, isActive: userToUpdate.isActive } });
    } catch (err) {
        console.error('Toggle user status error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
