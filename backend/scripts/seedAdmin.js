require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const adminEmail = 'admin@project.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists.');
    } else {
      const admin = new User({
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user seeded successfully.');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding admin:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
