const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BodyMeasurement = sequelize.define('BodyMeasurement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'client_id',
    },
    measuredAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'measured_at',
    },
    weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    chest: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    waist: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    hips: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    arms: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    thighs: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'body_measurements',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['client_id', 'measured_at'] },
    ],
});

module.exports = BodyMeasurement;
