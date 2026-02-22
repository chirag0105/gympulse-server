const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExerciseLog = sequelize.define('ExerciseLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    workoutLogId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'workout_log_id',
    },
    workoutExerciseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'workout_exercise_id',
    },
    exerciseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'exercise_id',
    },
    setNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'set_number',
    },
    repsCompleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reps_completed',
    },
    weightUsed: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        field: 'weight_used',
    },
    rpe: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 10 },
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_completed',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'exercise_logs',
    timestamps: true,
    underscored: true,
});

module.exports = ExerciseLog;
