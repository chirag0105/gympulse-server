/**
 * Super Admin Seed Script
 */
const bcrypt = require('bcryptjs');
const env = require('../config/env');

async function createSuperAdmin() {
    const { User, sequelize } = require('../models');

    try {
        const email = env.SUPER_ADMIN_EMAIL;
        const password = env.SUPER_ADMIN_PASSWORD;

        // Check if super admin already exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            console.log(`[SEED] Super admin already exists: ${email}`);
            return;
        }

        // Create super admin
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
            email,
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'super_admin',
        });

        console.log(`✅ [SEED] Super admin created successfully!`);
    } catch (error) {
        console.error('❌ [SEED] Failed to create super admin:', error.message);
    }
}

// Support running directly as well
if (require.main === module) {
    createSuperAdmin().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = createSuperAdmin;
