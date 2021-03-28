'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Roles', [
      {
        name: 'ADMIN',
        description: 'role administrateur'
      },
      {
        name: 'READER',
        description: 'role simple'
      },
    ], { validate: true });
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Roles', null, {});
  }
};
