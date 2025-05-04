import { Audit } from './audit.model';
import { Company } from './company.model';
import { Config } from './config.model';
import { Configuration } from './configuration.model';
import { Department } from './department.model';
import { Employee } from './employee.model';
import { Justification } from './justification.model';
import { Notification } from './notification.model';
import { Point } from './point.model';
import { Report } from './report.model';
import { Schedule } from './schedule.model';
import { User } from './user.model';

export function setupRelationships(): void {
  // Company relationships
  Company.hasMany(Department, { foreignKey: 'companyId' });
  Company.hasMany(User, { foreignKey: 'companyId' });
  Company.hasMany(Point, { foreignKey: 'companyId' });
  Company.hasMany(Notification, { foreignKey: 'companyId' });
  Company.hasMany(Audit, { foreignKey: 'companyId' });
  Company.hasMany(Report, { foreignKey: 'companyId' });
  Company.hasMany(Configuration, { foreignKey: 'companyId' });
  Company.hasMany(Employee, { foreignKey: 'companyId' });
  Company.hasOne(Config, { foreignKey: 'companyId' });

  // Department relationships
  Department.belongsTo(Company, { foreignKey: 'companyId' });
  Department.hasMany(User, { foreignKey: 'departmentId' });
  Department.hasMany(Point, { foreignKey: 'departmentId' });
  Department.hasMany(Notification, { foreignKey: 'departmentId' });
  Department.hasMany(Audit, { foreignKey: 'departmentId' });
  Department.hasMany(Report, { foreignKey: 'departmentId' });
  Department.hasMany(Employee, { foreignKey: 'departmentId' });

  // User relationships
  User.belongsTo(Company, { foreignKey: 'companyId' });
  User.belongsTo(Department, { foreignKey: 'departmentId' });
  User.hasMany(Point, { foreignKey: 'userId' });
  User.hasMany(Notification, { foreignKey: 'userId' });
  User.hasMany(Audit, { foreignKey: 'userId' });
  User.hasMany(Report, { foreignKey: 'userId' });
  User.hasOne(Employee, { foreignKey: 'userId' });
  User.hasMany(Justification, { foreignKey: 'userId' });

  // Point relationships
  Point.belongsTo(User, { foreignKey: 'userId' });
  Point.belongsTo(Company, { foreignKey: 'companyId' });
  Point.belongsTo(Department, { foreignKey: 'departmentId' });
  Point.belongsTo(Schedule, { foreignKey: 'scheduleId' });
  Point.hasMany(Justification, { foreignKey: 'pointId' });

  // Schedule relationships
  Schedule.hasMany(Point, { foreignKey: 'scheduleId' });

  // Notification relationships
  Notification.belongsTo(User, { foreignKey: 'userId' });
  Notification.belongsTo(Company, { foreignKey: 'companyId' });
  Notification.belongsTo(Department, { foreignKey: 'departmentId' });

  // Audit relationships
  Audit.belongsTo(User, { foreignKey: 'userId' });
  Audit.belongsTo(Company, { foreignKey: 'companyId' });
  Audit.belongsTo(Department, { foreignKey: 'departmentId' });

  // Report relationships
  Report.belongsTo(User, { foreignKey: 'userId' });
  Report.belongsTo(Company, { foreignKey: 'companyId' });
  Report.belongsTo(Department, { foreignKey: 'departmentId' });

  // Configuration relationships
  Configuration.belongsTo(Company, { foreignKey: 'companyId' });

  // Config relationships
  Config.belongsTo(Company, { foreignKey: 'companyId' });

  // Employee relationships
  Employee.belongsTo(User, { foreignKey: 'userId' });
  Employee.belongsTo(Company, { foreignKey: 'companyId' });
  Employee.belongsTo(Department, { foreignKey: 'departmentId' });

  // Justification relationships
  Justification.belongsTo(User, { foreignKey: 'userId' });
  Justification.belongsTo(Company, { foreignKey: 'companyId' });
  Justification.belongsTo(Department, { foreignKey: 'departmentId' });
  Justification.belongsTo(Point, { foreignKey: 'pointId' });
} 