import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Company } from './company.model';

export class Department extends Model {
  public id!: string;
  public name!: string;
  public companyId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
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
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['companyId'],
      },
    ],
  }
);

Department.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(Department, { foreignKey: 'companyId' }); 