'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Refreshtokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        references: {
          model: {
            tableName: 'users'
          },
          key: 'id'
        },
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING
      },
      expires: {
        type: Sequelize.DATE
      },
      createdByIp: {
        type: Sequelize.STRING
      },
      revoked: {
        type: Sequelize.DATE
      },
      revokedByIp: {
        type: Sequelize.DATE
      },
      replacedByToken: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Refreshtokens');
  }
};