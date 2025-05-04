import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Company extends Model {
  public id!: string;
  public name!: string;
  public cnpj!: string;
  public address!: string;
  public phone!: string;
  public email!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'companies',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['cnpj'],
      },
      {
        fields: ['email'],
      },
    ],
  }
); 