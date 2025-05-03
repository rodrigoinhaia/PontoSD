import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Departamento } from './departamento.model';

export class Empresa extends Model {
  public id!: number;
  public name!: string;
  public cnpj!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Empresa.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
  },
  {
    sequelize,
    tableName: 'empresas',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['cnpj'],
      },
    ],
  }
);

Empresa.hasMany(User, { foreignKey: 'companyId' });
User.belongsTo(Empresa, { foreignKey: 'companyId' });

Empresa.hasMany(Departamento, { foreignKey: 'companyId' });
Departamento.belongsTo(Empresa, { foreignKey: 'companyId' }); 