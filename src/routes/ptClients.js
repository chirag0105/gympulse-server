const express = require('express');
const router = express.Router();
const { PtClient, User } = require('../models');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// @route   GET /api/pt-clients
// @desc    Get all clients for a PT
// @access  Private (PT)
router.get('/', auth, roleGuard(['pt', 'super_admin']), async (req, res) => {
    try {
        const query = req.user.role === 'super_admin' ? {} : { ptId: req.user.id };
        const clients = await PtClient.findAll({
            where: query,
            include: [{
                model: User,
                as: 'client',
                attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage', 'isActive']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, count: clients.length, data: clients });
    } catch (err) {
        console.error('Get PT clients error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/pt-clients/invite
// @desc    Invite a client via email
// @access  Private (PT)
router.post('/invite', auth, roleGuard(['pt', 'super_admin']), async (req, res) => {
    try {
        const { clientEmail } = req.body;
        const ptId = req.user.role === 'super_admin' ? req.body.ptId : req.user.id;

        if (!clientEmail) {
            return res.status(400).json({ success: false, message: 'Client email is required' });
        }

        // Check the 5 clients limit
        const totalClients = await PtClient.count({
            where: { ptId, status: ['active', 'invited'] }
        });

        if (totalClients >= 5 && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'You have reached the maximum limit of 5 clients' });
        }

        // Check if the client email is already invited or active with this PT
        const existingRelation = await PtClient.findOne({
            where: { ptId, clientEmail }
        });

        if (existingRelation) {
            return res.status(400).json({ success: false, message: 'Client already invited or active' });
        }

        // Search for existing user with this email to possibly auto-link them
        const existingUser = await User.findOne({ where: { email: clientEmail } });

        const newClient = await PtClient.create({
            ptId,
            clientEmail,
            clientId: existingUser ? existingUser.id : null,
            status: existingUser ? 'active' : 'invited',
            joinedAt: existingUser ? new Date() : null
        });

        res.status(201).json({ success: true, data: newClient });
    } catch (err) {
        console.error('Invite client error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/pt-clients/:id
// @desc    Remove a client link
// @access  Private (PT, super_admin)
router.delete('/:id', auth, roleGuard(['pt', 'super_admin']), async (req, res) => {
    try {
        const ptClient = await PtClient.findByPk(req.params.id);

        if (!ptClient) {
            return res.status(404).json({ success: false, message: 'Client connection not found' });
        }

        if (ptClient.ptId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
        }

        await ptClient.destroy();
        res.json({ success: true, message: 'Client removed successfully' });
    } catch (err) {
        console.error('Remove client error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
