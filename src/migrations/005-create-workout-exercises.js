'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('workout_exercises', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            workout_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'workouts', key: 'id' }, onDelete: 'CASCADE' },
            exercise_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'exercises', key: 'id' }, onDelete: 'CASCADE' },
            order_index: { type: Sequelize.INTEGER, allowNull: false },
            sets: { type: Sequelize.INTEGER, allowNull: false },
            reps: { type: Sequelize.INTEGER, allowNull: false },
            weight: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
            rpe: { type: Sequelize.INTEGER, allowNull: true },
            rest_seconds: { type: Sequelize.INTEGER, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('workout_exercises', ['workout_id']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('workout_exercises');
    },
};
