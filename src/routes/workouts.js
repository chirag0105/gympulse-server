const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { Workout, WorkoutExercise, Exercise } = require('../models');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Utility to verify workout ownership
const verifyOwnership = async (req, res, next) => {
    try {
        const workout = await Workout.findByPk(req.params.id);
        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }
        if (workout.ptId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this workout' });
        }
        req.workout = workout;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @route   POST /api/workouts
// @desc    Create a new workout
// @access  Private (PT, super_admin)
router.post('/', auth, roleGuard(['pt', 'super_admin']), async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, description, exercises } = req.body;

        const workout = await Workout.create({
            ptId: req.user.id,
            name,
            description
        }, { transaction: t });

        if (exercises && exercises.length > 0) {
            const workoutExercises = exercises.map((ex, index) => ({
                workoutId: workout.id,
                exerciseId: ex.exerciseId,
                orderIndex: index,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight || null,
                rpe: ex.rpe || null,
                restSeconds: ex.restSeconds || null,
                notes: ex.notes || null,
            }));

            await WorkoutExercise.bulkCreate(workoutExercises, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ success: true, data: workout });
    } catch (err) {
        await t.rollback();
        console.error('Create workout error:', err);
        res.status(500).json({ success: false, message: 'Server error parsing workout' });
    }
});

// @route   GET /api/workouts
// @desc    Get all workouts for user
// @access  Private (PT, super_admin)
router.get('/', auth, roleGuard(['pt', 'super_admin']), async (req, res) => {
    try {
        const query = req.user.role === 'super_admin' ? {} : { ptId: req.user.id };
        const workouts = await Workout.findAll({
            where: query,
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, count: workouts.length, data: workouts });
    } catch (err) {
        console.error('Get workouts error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/workouts/:id
// @desc    Get single workout by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findByPk(req.params.id, {
            include: [{
                model: WorkoutExercise,
                as: 'exercises',
                include: [{ model: Exercise, as: 'exerciseDetails' }]
            }],
            order: [[{ model: WorkoutExercise, as: 'exercises' }, 'orderIndex', 'ASC']]
        });

        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        res.json({ success: true, data: workout });
    } catch (err) {
        console.error('Get workout by id error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/workouts/:id
// @desc    Update a workout
// @access  Private (PT, super_admin)
router.put('/:id', auth, roleGuard(['pt', 'super_admin']), verifyOwnership, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, description, exercises } = req.body;

        await req.workout.update({ name, description }, { transaction: t });

        if (exercises) {
            // Delete existing exercises
            await WorkoutExercise.destroy({ where: { workoutId: req.workout.id }, transaction: t });

            if (exercises.length > 0) {
                const workoutExercises = exercises.map((ex, index) => ({
                    workoutId: req.workout.id,
                    exerciseId: ex.exerciseId,
                    orderIndex: index,
                    sets: ex.sets,
                    reps: ex.reps,
                    weight: ex.weight || null,
                    rpe: ex.rpe || null,
                    restSeconds: ex.restSeconds || null,
                    notes: ex.notes || null,
                }));
                await WorkoutExercise.bulkCreate(workoutExercises, { transaction: t });
            }
        }

        await t.commit();
        res.json({ success: true, data: req.workout });
    } catch (err) {
        await t.rollback();
        console.error('Update workout error:', err);
        res.status(500).json({ success: false, message: 'Server error updating workout' });
    }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete a workout
// @access  Private (PT, super_admin)
router.delete('/:id', auth, roleGuard(['pt', 'super_admin']), verifyOwnership, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        await WorkoutExercise.destroy({ where: { workoutId: req.workout.id }, transaction: t });
        await req.workout.destroy({ transaction: t });

        await t.commit();
        res.json({ success: true, message: 'Workout deleted' });
    } catch (err) {
        await t.rollback();
        console.error('Delete workout error:', err);
        res.status(500).json({ success: false, message: 'Server error deleting workout' });
    }
});

module.exports = router;
