const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { ScheduledWorkout, Workout, WorkoutExercise, Exercise, PtClient } = require('../models');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// @route   POST /api/schedules
// @desc    Schedule a workout for a client
// @access  Private (PT, super_admin)
router.post('/', auth, roleGuard(['pt', 'super_admin']), async (req, res) => {
    try {
        const { clientId, workoutId, scheduledDate } = req.body;

        if (!clientId || !workoutId || !scheduledDate) {
            return res.status(400).json({ success: false, message: 'Please provide clientId, workoutId, and scheduledDate' });
        }

        // Validate PT owns the workout
        const workout = await Workout.findByPk(workoutId);
        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }
        if (workout.ptId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to schedule this workout' });
        }

        // Validate PT is linked to the client
        if (req.user.role !== 'super_admin') {
            const link = await PtClient.findOne({
                where: { ptId: req.user.id, clientId, status: 'active' }
            });
            if (!link) {
                return res.status(403).json({ success: false, message: 'Client is not linked to your account or is not active' });
            }
        }

        const scheduledWorkout = await ScheduledWorkout.create({
            ptId: workout.ptId,
            clientId,
            workoutId,
            scheduledDate
        });

        res.status(201).json({ success: true, data: scheduledWorkout });
    } catch (err) {
        // Handle unique constraint error
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'This workout is already scheduled for the client on this date' });
        }
        console.error('Create schedule error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/schedules
// @desc    Get schedules for a given date range
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, clientId } = req.query;

        let whereQuery = {};

        // Query by Date Range
        if (startDate && endDate) {
            whereQuery.scheduledDate = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            whereQuery.scheduledDate = { [Op.gte]: startDate };
        } else if (endDate) {
            whereQuery.scheduledDate = { [Op.lte]: endDate };
        }

        // Apply access constraints
        if (req.user.role === 'client') {
            whereQuery.clientId = req.user.id;
        } else if (req.user.role === 'pt') {
            whereQuery.ptId = req.user.id;
            if (clientId) {
                whereQuery.clientId = clientId;
            }
        } else if (req.user.role === 'super_admin' && clientId) {
            whereQuery.clientId = clientId;
        }

        const schedules = await ScheduledWorkout.findAll({
            where: whereQuery,
            include: [{
                model: Workout,
                include: [{
                    model: WorkoutExercise,
                    as: 'exercises',
                    include: [{ model: Exercise, as: 'exerciseDetails' }]
                }]
            }],
            order: [['scheduledDate', 'ASC']]
        });

        res.json({ success: true, count: schedules.length, data: schedules });
    } catch (err) {
        console.error('Get schedules error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/schedules/:id
// @desc    Remove a scheduled workout
// @access  Private (PT, super_admin)
router.delete('/:id', auth, roleGuard(['pt', 'super_admin']), async (req, res) => {
    try {
        const schedule = await ScheduledWorkout.findByPk(req.params.id);

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Scheduled workout not found' });
        }

        if (schedule.ptId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
        }

        await schedule.destroy();
        res.json({ success: true, message: 'Scheduled workout removed successfully' });
    } catch (err) {
        console.error('Remove schedule error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
