'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('body_measurements', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            client_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            measured_at: { type: Sequelize.DATEONLY, allowNull: false },
            weight: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
            chest: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
            waist: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
            hips: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
            arms: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
            thighs: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('body_measurements', ['client_id', 'measured_at']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('body_measurements');
    },
};
