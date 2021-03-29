'use strict';
const bcrypt = require('bcryptjs')
const db = require('../models/index');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // hash password
      const passwordHash = await bcrypt.hash('adminadmin', 10);
      // save this user
      const roles = await db.Role.findOne({ where: { name: 'ADMIN' } });
      await queryInterface.bulkInsert('Users', [{
        firstName: 'John',
        lastName: 'DOE',
        email: 'admin0@gmail.com',
        avatar: '/images/avatar.png',
        password: passwordHash,
        roleId: roles.id,
        verified: new Date(),
        verificationToken: null,
        createdAt: new Date()
      }], { validate: true }, { transaction })
      await transaction.commit()
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
