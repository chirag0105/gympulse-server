'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notifications', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            type: { type: Sequelize.ENUM('workout_assigned', 'workout_reminder', 'client_joined', 'measurement_reminder', 'system'), allowNull: false },
            title: { type: Sequelize.STRING(255), allowNull: false },
            message: { type: Sequelize.TEXT, allowNull: false },
            is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
            metadata: { type: Sequelize.JSON, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('notifications', ['user_id', 'is_read']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('notifications');
    },
};
