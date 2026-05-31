import bcrypt from 'bcryptjs';
import { AuditStatus, IncidentSeverity, Role, VulnerabilityStatus } from '@prisma/client';
import { prisma } from '../src/config/prisma';

const PASSWORD = 'Admin123!';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  await prisma.mitigation.deleteMany();
  await prisma.vulnerability.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  await prisma.department.createMany({
    data: [
      { id: 1, name: 'SOC', description: 'Security Operations Center' },
      { id: 2, name: 'IT', description: 'Core IT infrastructure' },
      { id: 3, name: 'Finance', description: 'Financial systems and services' },
      { id: 4, name: 'HR', description: 'Human resources management' },
      { id: 5, name: 'Operations', description: 'Operational technology and logistics' }
    ]
  });

  await prisma.user.createMany({
    data: [
      { id: 1, username: 'admin', email: 'admin@demo.local', passwordHash, role: Role.ADMIN, departmentId: 1, phone: '+1000000001' },
      { id: 2, username: 'supervisor_soc', email: 'supervisor.soc@demo.local', passwordHash, role: Role.SUPERVISOR, departmentId: 1, phone: '+1000000002' },
      { id: 3, username: 'supervisor_it', email: 'supervisor.it@demo.local', passwordHash, role: Role.SUPERVISOR, departmentId: 2, phone: '+1000000003' },
      { id: 4, username: 'user_fin', email: 'user.finance@demo.local', passwordHash, role: Role.USER, departmentId: 3, phone: '+1000000004' },
      { id: 5, username: 'user_hr', email: 'user.hr@demo.local', passwordHash, role: Role.USER, departmentId: 4, phone: '+1000000005' },
      { id: 6, username: 'user_ops', email: 'user.ops@demo.local', passwordHash, role: Role.USER, departmentId: 5, phone: '+1000000006' }
    ]
  });

  await prisma.asset.createMany({
    data: [
      { id: 1, name: 'Core Router', room: 'R-101', departmentId: 2 },
      { id: 2, name: 'Payroll Server', room: 'R-210', departmentId: 3 },
      { id: 3, name: 'HR Portal VM', room: 'R-305', departmentId: 4 },
      { id: 4, name: 'Warehouse Scanner Hub', room: 'R-402', departmentId: 5 },
      { id: 5, name: 'SOC SIEM Node', room: 'R-110', departmentId: 1 },
      { id: 6, name: 'Backup NAS', room: 'R-120', departmentId: 2 }
    ]
  });

  await prisma.vulnerability.createMany({
    data: [
      { id: 1, title: 'Outdated firmware', cvss: 8.7, status: VulnerabilityStatus.OPEN, assetId: 1 },
      { id: 2, title: 'Weak admin password policy', cvss: 7.8, status: VulnerabilityStatus.OPEN, assetId: 2 },
      { id: 3, title: 'Unpatched OS package', cvss: 6.9, status: VulnerabilityStatus.MITIGATED, assetId: 3 },
      { id: 4, title: 'Open management port', cvss: 9.1, status: VulnerabilityStatus.OPEN, assetId: 4 },
      { id: 5, title: 'TLS misconfiguration', cvss: 6.4, status: VulnerabilityStatus.MITIGATED, assetId: 5 },
      { id: 6, title: 'Default credentials present', cvss: 9.5, status: VulnerabilityStatus.OPEN, assetId: 6 }
    ]
  });

  await prisma.mitigation.createMany({
    data: [
      { id: 1, title: 'Upgrade firmware', description: 'Apply latest firmware package', vulnerabilityId: 1, dueDate: new Date('2026-06-20T10:00:00.000Z') },
      { id: 2, title: 'Enforce strong password policy', description: 'Require 12+ chars and complexity', vulnerabilityId: 2, dueDate: new Date('2026-06-18T10:00:00.000Z') },
      { id: 3, title: 'Apply OS updates', description: 'Install monthly patch set', vulnerabilityId: 3, dueDate: new Date('2026-06-10T10:00:00.000Z') },
      { id: 4, title: 'Restrict management interface', description: 'Allowlist SOC jump host only', vulnerabilityId: 4, dueDate: new Date('2026-06-12T10:00:00.000Z') },
      { id: 5, title: 'Fix TLS ciphers', description: 'Disable weak ciphers and TLS 1.0', vulnerabilityId: 5, dueDate: new Date('2026-06-16T10:00:00.000Z') },
      { id: 6, title: 'Rotate default credentials', description: 'Set unique credentials and vault them', vulnerabilityId: 6, dueDate: new Date('2026-06-14T10:00:00.000Z') }
    ]
  });

  await prisma.audit.createMany({
    data: [
      { id: 1, title: 'SOC hardening audit', status: AuditStatus.PLANNED, date: new Date('2026-06-05T09:00:00.000Z'), departmentId: 1 },
      { id: 2, title: 'IT network segmentation audit', status: AuditStatus.IN_PROGRESS, date: new Date('2026-06-07T09:00:00.000Z'), departmentId: 2 },
      { id: 3, title: 'Finance PCI readiness audit', status: AuditStatus.DONE, date: new Date('2026-05-15T09:00:00.000Z'), departmentId: 3 },
      { id: 4, title: 'HR access control audit', status: AuditStatus.PLANNED, date: new Date('2026-06-11T09:00:00.000Z'), departmentId: 4 },
      { id: 5, title: 'Operations OT security audit', status: AuditStatus.IN_PROGRESS, date: new Date('2026-06-09T09:00:00.000Z'), departmentId: 5 },
      { id: 6, title: 'Backup resilience audit', status: AuditStatus.DONE, date: new Date('2026-05-22T09:00:00.000Z'), departmentId: 2 }
    ]
  });

  await prisma.incident.createMany({
    data: [
      { id: 1, title: 'Phishing campaign detected', description: 'Employees reported phishing emails', severity: IncidentSeverity.HIGH, departmentId: 1, assetId: 5, reporterId: 2 },
      { id: 2, title: 'Router CPU spike', description: 'Unexpected sustained high CPU usage', severity: IncidentSeverity.MEDIUM, departmentId: 2, assetId: 1, reporterId: 3 },
      { id: 3, title: 'Payroll service outage', description: 'Payroll UI unavailable for 20 minutes', severity: IncidentSeverity.HIGH, departmentId: 3, assetId: 2, reporterId: 4 },
      { id: 4, title: 'Unauthorized HR portal login', description: 'Multiple failed login attempts', severity: IncidentSeverity.MEDIUM, departmentId: 4, assetId: 3, reporterId: 5 },
      { id: 5, title: 'Scanner hub reboot loop', description: 'Warehouse scanner controller unstable', severity: IncidentSeverity.LOW, departmentId: 5, assetId: 4, reporterId: 6 },
      { id: 6, title: 'Backup integrity warning', description: 'Nightly verification found corrupted block', severity: IncidentSeverity.CRITICAL, departmentId: 2, assetId: 6, reporterId: 1 }
    ]
  });

  console.log('Seed completed. Demo credentials: admin / Admin123!');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
