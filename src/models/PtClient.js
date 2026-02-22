const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PtClient = sequelize.define('PtClient', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ptId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'pt_id',
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'client_id',
    },
    clientEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'client_email',
        validate: { isEmail: true },
    },
    status: {
        type: DataTypes.ENUM('invited', 'active', 'inactive'),
        defaultValue: 'invited',
    },
    invitedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'invited_at',
    },
    joinedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'joined_at',
    },
}, {
    tableName: 'pt_clients',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['pt_id', 'client_email'] },
    ],
});

module.exports = PtClient;
