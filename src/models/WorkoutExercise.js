const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkoutExercise = sequelize.define('WorkoutExercise', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    workoutId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'workout_id',
    },
    exerciseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'exercise_id',
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_index',
    },
    sets: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reps: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    weight: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
    },
    rpe: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 10 },
    },
    restSeconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'rest_seconds',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'workout_exercises',
    timestamps: true,
    underscored: true,
});

module.exports = WorkoutExercise;
