const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Exercise } = require('../models');
const auth = require('../middleware/auth');

// @route   GET /api/exercises
// @desc    Get all exercises (with optional filters)
// @access  Private (auth required)
router.get('/', auth, async (req, res) => {
    try {
        const { muscleGroup, search } = req.query;
        let whereCondition = {};

        if (muscleGroup) {
            whereCondition.muscleGroup = muscleGroup;
        }

        if (search) {
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const exercises = await Exercise.findAll({
            where: whereCondition,
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            count: exercises.length,
            data: exercises
        });
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
