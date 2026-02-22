'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('exercise_logs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            workout_log_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'workout_logs', key: 'id' }, onDelete: 'CASCADE' },
            workout_exercise_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'workout_exercises', key: 'id' }, onDelete: 'CASCADE' },
            exercise_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'exercises', key: 'id' }, onDelete: 'CASCADE' },
            set_number: { type: Sequelize.INTEGER, allowNull: false },
            reps_completed: { type: Sequelize.INTEGER, allowNull: true },
            weight_used: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
            rpe: { type: Sequelize.INTEGER, allowNull: true },
            is_completed: { type: Sequelize.BOOLEAN, defaultValue: false },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('exercise_logs', ['workout_log_id']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('exercise_logs');
    },
};
