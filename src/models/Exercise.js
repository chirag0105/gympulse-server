const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exercise = sequelize.define('Exercise', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    muscleGroup: {
        type: DataTypes.ENUM('chest', 'back', 'shoulders', 'legs', 'arms', 'core'),
        allowNull: false,
        field: 'muscle_group',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    youtubeUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'youtube_url',
    },
    equipment: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    difficulty: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'intermediate',
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'image_url',
    },
}, {
    tableName: 'exercises',
    timestamps: true,
    underscored: true,
});

module.exports = Exercise;
