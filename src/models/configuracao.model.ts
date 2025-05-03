import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Configuracao extends Model {
  public id!: number;
  public key!: string;
  public value!: string;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Configuracao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'configuracoes',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['key'],
      },
    ],
  }
);

Configuracao.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Configuracao, { foreignKey: 'userId' }); 