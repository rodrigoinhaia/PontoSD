import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Colaborador } from './colaborador.model';
import { User } from './user.model';

export class Overtime extends Model {
  public id!: number;
  public colaboradorId!: number;
  public data!: Date;
  public horaInicio!: string;
  public horaFim!: string;
  public horas!: number;
  public tipo!: 'diurna' | 'noturna' | 'domingo' | 'feriado';
  public status!: 'pendente' | 'aprovado' | 'rejeitado';
  public observacao?: string;
  public aprovadoPorId?: number;
  public dataAprovacao?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Overtime.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    colaboradorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'colaboradores',
        key: 'id',
      },
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true,
      },
    },
    horaInicio: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    horaFim: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    horas: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0.5,
        max: 12,
      },
    },
    tipo: {
      type: DataTypes.ENUM('diurna', 'noturna', 'domingo', 'feriado'),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['diurna', 'noturna', 'domingo', 'feriado']],
      },
    },
    status: {
      type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
      allowNull: false,
      defaultValue: 'pendente',
      validate: {
        notEmpty: true,
        isIn: [['pendente', 'aprovado', 'rejeitado']],
      },
    },
    observacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aprovadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    dataAprovacao: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'overtimes',
    modelName: 'Overtime',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['colaboradorId'],
      },
      {
        fields: ['data'],
      },
      {
        fields: ['tipo'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['aprovadoPorId'],
      },
    ],
  }
);

// Relacionamentos
Overtime.belongsTo(Colaborador, {
  foreignKey: 'colaboradorId',
  as: 'colaborador',
});

Overtime.belongsTo(User, {
  foreignKey: 'aprovadoPorId',
  as: 'aprovadoPor',
});

export default Overtime; 