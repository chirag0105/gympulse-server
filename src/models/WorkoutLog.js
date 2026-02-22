const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkoutLog = sequelize.define('WorkoutLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    scheduledWorkoutId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'scheduled_workout_id',
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'client_id',
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'started_at',
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at',
    },
    durationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_seconds',
    },
    totalWeightLifted: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'total_weight_lifted',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'workout_logs',
    timestamps: true,
    underscored: true,
});

module.exports = WorkoutLog;
