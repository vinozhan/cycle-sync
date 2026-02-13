import mongoose from 'mongoose';
import env from './config/env.js';
import User from './models/User.js';

const ADMIN_DEFAULTS = {
  firstName: 'Admin',
  lastName: 'User',
  email: process.env.ADMIN_EMAIL || 'admin@cyclesync.lk',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
};

const seed = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_DEFAULTS.email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`Admin already exists: ${existing.email}`);
      } else {
        existing.role = 'admin';
        await existing.save();
        console.log(`Promoted existing user to admin: ${existing.email}`);
      }
    } else {
      await User.create({
        ...ADMIN_DEFAULTS,
        role: 'admin',
      });
      console.log(`Admin account created: ${ADMIN_DEFAULTS.email}`);
    }

    console.log('\nAdmin credentials:');
    console.log(`  Email:    ${ADMIN_DEFAULTS.email}`);
    console.log(`  Password: ${ADMIN_DEFAULTS.password}`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDone.');
  }
};

seed();
