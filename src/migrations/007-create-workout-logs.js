'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('workout_logs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            scheduled_workout_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'scheduled_workouts', key: 'id' }, onDelete: 'CASCADE' },
            client_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            started_at: { type: Sequelize.DATE, allowNull: false },
            completed_at: { type: Sequelize.DATE, allowNull: true },
            duration_seconds: { type: Sequelize.INTEGER, allowNull: true },
            total_weight_lifted: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('workout_logs', ['client_id']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('workout_logs');
    },
};
