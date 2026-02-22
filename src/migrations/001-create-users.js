'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
            password: { type: Sequelize.STRING(255), allowNull: false },
            first_name: { type: Sequelize.STRING(100), allowNull: false },
            last_name: { type: Sequelize.STRING(100), allowNull: false },
            role: { type: Sequelize.ENUM('super_admin', 'pt', 'client'), allowNull: false },
            profile_image: { type: Sequelize.STRING(500), allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            last_login_at: { type: Sequelize.DATE, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        });

        await queryInterface.addIndex('users', ['role']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('users');
    },
};
