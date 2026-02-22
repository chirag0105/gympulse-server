/**
 * Super Admin Seed Script
 * Run: node src/seeders/create-super-admin.js
 */
const bcrypt = require('bcryptjs');
const env = require('../config/env');

async function createSuperAdmin() {
    // Import models (this sets up associations)
    const { User, sequelize } = require('../models');

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync the User model only (in case migrations haven't run)
        await User.sync();

        const email = env.SUPER_ADMIN_EMAIL;
        const password = env.SUPER_ADMIN_PASSWORD;

        // Check if super admin already exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            console.log(`Super admin already exists: ${email}`);
            await sequelize.close();
            return;
        }

        // Create super admin
        const hashedPassword = await bcrypt.hash(password, 12);
        const admin = await User.create({
            email,
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'super_admin',
        });

        console.log(`✅ Super admin created successfully!`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);

        await sequelize.close();
    } catch (error) {
        console.error('❌ Failed to create super admin:', error);
        process.exit(1);
    }
}

createSuperAdmin();
