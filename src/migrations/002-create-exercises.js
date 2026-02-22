'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('exercises', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            name: { type: Sequelize.STRING(200), allowNull: false },
            muscle_group: { type: Sequelize.ENUM('chest', 'back', 'shoulders', 'legs', 'arms', 'core'), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: false },
            youtube_url: { type: Sequelize.STRING(500), allowNull: true },
            equipment: { type: Sequelize.STRING(100), allowNull: true },
            difficulty: { type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'intermediate' },
            image_url: { type: Sequelize.STRING(500), allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('exercises', ['muscle_group']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('exercises');
    },
};
