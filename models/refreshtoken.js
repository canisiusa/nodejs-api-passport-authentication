'use strict';
const {
  Model, Deferrable
} = require('sequelize');
const User = require('./user')
module.exports = (sequelize, DataTypes) => {
  class Refreshtoken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Refreshtoken.belongsTo(models.User)
    }
  };
  Refreshtoken.init({
    token: DataTypes.STRING,
    expires: DataTypes.DATE,
    createdByIp: DataTypes.STRING,
    revoked: DataTypes.DATE,
    revokedByIp: DataTypes.DATE,
    replacedByToken: DataTypes.STRING,
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE //- Immediately check the foreign key constraints
      }
    },
    isExpired: {
      type: DataTypes.VIRTUAL,
      get() { return Date.now() >= this.expires; }
    },
    isActive: {
      type: DataTypes.VIRTUAL,
      get() { return !this.revoked && !this.isExpired; }
    }
  }, {
    sequelize,
    modelName: 'Refreshtoken',
  });
  return Refreshtoken;
};