const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { WorkoutLog, ExerciseLog, ScheduledWorkout, Workout, WorkoutExercise, Exercise, PtClient } = require('../models');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// @route   POST /api/logs/start
// @desc    Start a scheduled workout session
// @access  Private (Client)
router.post('/start', auth, roleGuard(['client']), async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { scheduledWorkoutId } = req.body;

        const scheduledWorkout = await ScheduledWorkout.findOne({
            where: { id: scheduledWorkoutId, clientId: req.user.id },
            include: [{
                model: Workout,
                include: [{ model: WorkoutExercise, as: 'exercises' }]
            }],
            transaction: t
        });

        if (!scheduledWorkout) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Scheduled workout not found' });
        }

        if (scheduledWorkout.status === 'completed') {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Workout already completed' });
        }

        // Check if a WorkoutLog already exists (resume)
        let workoutLog = await WorkoutLog.findOne({
            where: { scheduledWorkoutId },
            include: [{
                model: ExerciseLog,
                as: 'exerciseLogs',
                include: [{ model: Exercise }]
            }],
            transaction: t,
            order: [[{ model: ExerciseLog, as: 'exerciseLogs' }, 'createdAt', 'ASC']]
        });

        if (!workoutLog) {
            // Create new WorkoutLog
            workoutLog = await WorkoutLog.create({
                scheduledWorkoutId,
                clientId: req.user.id,
                startedAt: new Date()
            }, { transaction: t });

            // Generate ExerciseLog entries
            const exerciseLogsData = [];

            for (const wex of scheduledWorkout.Workout.exercises) {
                // Ensure default sets are numeric
                const sets = wex.sets || 3;
                for (let i = 1; i <= sets; i++) {
                    exerciseLogsData.push({
                        workoutLogId: workoutLog.id,
                        workoutExerciseId: wex.id,
                        exerciseId: wex.exerciseId,
                        setNumber: i,
                        repsCompleted: wex.reps, // Target as default
                        weightUsed: wex.weight, // Target as default
                        isCompleted: false
                    });
                }
            }

            await ExerciseLog.bulkCreate(exerciseLogsData, { transaction: t });

            // Mark ScheduledWorkout as in_progress
            scheduledWorkout.status = 'in_progress';
            await scheduledWorkout.save({ transaction: t });

            // Re-fetch to include logs for client
            workoutLog = await WorkoutLog.findOne({
                where: { id: workoutLog.id },
                include: [{
                    model: ExerciseLog,
                    as: 'exerciseLogs',
                    include: [{ model: Exercise }, { model: WorkoutExercise }]
                }],
                transaction: t,
                order: [[{ model: ExerciseLog, as: 'exerciseLogs' }, 'createdAt', 'ASC']] // Just sequential creation
            });
        }

        await t.commit();
        res.status(200).json({ success: true, data: workoutLog });
    } catch (err) {
        await t.rollback();
        console.error('Start workout error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/logs/:logId/exercise/:exerciseLogId
// @desc    Update a specific exercise set
// @access  Private (Client)
router.put('/:logId/exercise/:exerciseLogId', auth, roleGuard(['client']), async (req, res) => {
    try {
        const { repsCompleted, weightUsed, isCompleted } = req.body;

        const exerciseLog = await ExerciseLog.findOne({
            where: { id: req.params.exerciseLogId, workoutLogId: req.params.logId }
        });

        if (!exerciseLog) {
            return res.status(404).json({ success: false, message: 'Exercise log child not found' });
        }

        // Just enforce ownership broadly through WorkoutLog
        const workoutLog = await WorkoutLog.findOne({
            where: { id: req.params.logId, clientId: req.user.id }
        });

        if (!workoutLog) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (repsCompleted !== undefined) exerciseLog.repsCompleted = repsCompleted;
        if (weightUsed !== undefined) exerciseLog.weightUsed = weightUsed;
        if (isCompleted !== undefined) exerciseLog.isCompleted = isCompleted;

        await exerciseLog.save();

        res.json({ success: true, data: exerciseLog });
    } catch (err) {
        console.error('Update exercise log error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/logs/:logId/finish
// @desc    Complete the workout and generate summary
// @access  Private (Client)
router.put('/:logId/finish', auth, roleGuard(['client']), async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const workoutLog = await WorkoutLog.findOne({
            where: { id: req.params.logId, clientId: req.user.id },
            include: [{ model: ExerciseLog, as: 'exerciseLogs' }],
            transaction: t
        });

        if (!workoutLog) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Workout log not found' });
        }

        const completedAt = new Date();
        const durationSeconds = Math.round((completedAt - workoutLog.startedAt) / 1000);

        // Sum volume (weight * reps) across completed sets
        let totalVolume = 0;
        workoutLog.exerciseLogs.forEach(log => {
            if (log.isCompleted) {
                const reps = log.repsCompleted || 0;
                const weight = parseFloat(log.weightUsed) || 0;
                totalVolume += (reps * weight);
            }
        });

        workoutLog.completedAt = completedAt;
        workoutLog.durationSeconds = durationSeconds;
        workoutLog.totalWeightLifted = totalVolume;
        await workoutLog.save({ transaction: t });

        const scheduledWorkout = await ScheduledWorkout.findByPk(workoutLog.scheduledWorkoutId, { transaction: t });
        if (scheduledWorkout) {
            scheduledWorkout.status = 'completed';
            await scheduledWorkout.save({ transaction: t });
        }

        await t.commit();
        res.json({
            success: true,
            data: {
                durationSeconds,
                totalVolume
            }
        });
    } catch (err) {
        await t.rollback();
        console.error('Finish workout error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/logs/:scheduledId
// @desc    Retrieve the workout log representing the current start for tracking UI load
// @access  Private (Client)
router.get('/:scheduledId', auth, roleGuard(['client']), async (req, res) => {
    try {
        const workoutLog = await WorkoutLog.findOne({
            where: { scheduledWorkoutId: req.params.scheduledId, clientId: req.user.id },
            include: [{
                model: ExerciseLog,
                as: 'exerciseLogs',
                include: [{ model: Exercise }, { model: WorkoutExercise }]
            }],
            order: [[{ model: ExerciseLog, as: 'exerciseLogs' }, 'createdAt', 'ASC']]
        });

        if (!workoutLog) {
            return res.status(404).json({ success: false, message: 'Workout log not started yet' });
        }

        res.json({ success: true, data: workoutLog });
    } catch (err) {
        console.error('Fetch log error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/logs/history/exercise/:exerciseId
// @desc    Retrieve historical exercise performance
// @access  Private (Client, PT)
router.get('/history/exercise/:exerciseId', auth, roleGuard(['client', 'pt']), async (req, res) => {
    try {
        let clientId = req.user.id;

        if (req.user.role === 'pt') {
            clientId = req.query.clientId;
            if (!clientId) {
                return res.status(400).json({ success: false, message: 'clientId is required for PTs' });
            }
            // Verify link
            const link = await PtClient.findOne({
                where: { ptId: req.user.id, clientId, status: 'active' }
            });
            if (!link) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this client' });
            }
        }

        const logs = await ExerciseLog.findAll({
            where: {
                exerciseId: req.params.exerciseId,
                isCompleted: true
            },
            include: [{
                model: WorkoutLog,
                where: {
                    clientId,
                    durationSeconds: { [Op.ne]: null } // Must be completed
                },
                attributes: ['id', 'completedAt', 'durationSeconds', 'startedAt']
            }],
            order: [[{ model: WorkoutLog }, 'completedAt', 'ASC']]
        });

        res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        console.error('Fetch exercise history error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
