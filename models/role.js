'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Role.belongsToMany(models.User, { through: 'Roleusers' }); // after features
      Role.hasMany(models.Roleuser, { foreignKey: 'roleId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

    }
  };
  Role.init({
    name: {
      type: DataTypes.ENUM('ADMIN','READER'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Role',
    timestamps: false
  });
  return Role;
};