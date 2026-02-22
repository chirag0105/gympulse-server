'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('scheduled_workouts', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            workout_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'workouts', key: 'id' }, onDelete: 'CASCADE' },
            client_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            pt_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            scheduled_date: { type: Sequelize.DATEONLY, allowNull: false },
            status: { type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'skipped'), defaultValue: 'scheduled' },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('scheduled_workouts', ['client_id', 'workout_id', 'scheduled_date'], { unique: true });
        await queryInterface.addIndex('scheduled_workouts', ['scheduled_date']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('scheduled_workouts');
    },
};
