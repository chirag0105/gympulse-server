const express = require('express');
const router = express.Router();
const { BodyMeasurement, PtClient } = require('../models');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// @route   POST /api/measurements
// @desc    Add a new body measurement
// @access  Private (Client)
router.post('/', auth, roleGuard(['client']), async (req, res) => {
    try {
        const { measuredAt, weight, chest, waist, hips, arms, thighs, notes } = req.body;

        if (!measuredAt) {
            return res.status(400).json({ success: false, message: 'measuredAt is required' });
        }

        const measurement = await BodyMeasurement.create({
            clientId: req.user.id,
            measuredAt,
            weight,
            chest,
            waist,
            hips,
            arms,
            thighs,
            notes
        });

        res.status(201).json({ success: true, data: measurement });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'Measurement for this date already exists' });
        }
        console.error('Create measurement error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/measurements
// @desc    Get all measurements for client
// @access  Private (Client, PT, SuberAdmin)
router.get('/', auth, async (req, res) => {
    try {
        let clientId = req.user.id; // Default to self for clients

        if (req.user.role === 'pt') {
            clientId = req.query.clientId;
            if (!clientId) {
                return res.status(400).json({ success: false, message: 'clientId query parameter is required for PTs' });
            }
            // Verify link
            const link = await PtClient.findOne({
                where: { ptId: req.user.id, clientId, status: 'active' }
            });
            if (!link) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this client' });
            }
        } else if (req.user.role === 'super_admin') {
            clientId = req.query.clientId;
            if (!clientId) {
                return res.status(400).json({ success: false, message: 'clientId query parameter is required for Super Admin' });
            }
        }

        const measurements = await BodyMeasurement.findAll({
            where: { clientId },
            order: [['measuredAt', 'DESC']]
        });

        res.json({ success: true, count: measurements.length, data: measurements });
    } catch (err) {
        console.error('Get measurements error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/measurements/:id
// @desc    Delete a body measurement
// @access  Private (Client)
router.delete('/:id', auth, roleGuard(['client']), async (req, res) => {
    try {
        const measurement = await BodyMeasurement.findOne({
            where: { id: req.params.id, clientId: req.user.id }
        });

        if (!measurement) {
            return res.status(404).json({ success: false, message: 'Measurement not found or unauthorized' });
        }

        await measurement.destroy();
        res.json({ success: true, message: 'Measurement deleted successfully' });
    } catch (err) {
        console.error('Delete measurement error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
