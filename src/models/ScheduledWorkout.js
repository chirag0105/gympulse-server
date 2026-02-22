const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScheduledWorkout = sequelize.define('ScheduledWorkout', {
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
    clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'client_id',
    },
    ptId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'pt_id',
    },
    scheduledDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'scheduled_date',
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'skipped'),
        defaultValue: 'scheduled',
    },
}, {
    tableName: 'scheduled_workouts',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['client_id', 'workout_id', 'scheduled_date'] },
    ],
});

module.exports = ScheduledWorkout;
