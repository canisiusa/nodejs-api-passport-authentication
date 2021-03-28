'use strict';
const {
  Model, Deferrable 
} = require('sequelize');
const Role = require('./role');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Role);
      User.hasMany(models.Refreshtoken, { foreignKey: 'userId', onDelete: 'CASCADE',   onUpdate: 'CASCADE' })
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ipaddress: DataTypes.STRING,
    avatar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    verificationToken: DataTypes.STRING,
    verified: DataTypes.DATE,
    resetToken: DataTypes.STRING,
    resetTokenExpires: DataTypes.DATE,
    passwordReset: { type: DataTypes.DATE },
    roleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Role,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE //- Immediately check the foreign key constraints
      }
    },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE },
    isVerified: {
      type: DataTypes.VIRTUAL,
      get() { return !!(this.verified || this.passwordReset); }
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
      set(value) {
        throw new Error('Do not try to set the `fullName` value!');
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};