import bcrypt from 'bcryptjs';
import { AuditStatus, IncidentSeverity, Role, VulnerabilityStatus } from '@prisma/client';
import { prisma } from '../src/config/prisma';

async function main() {
  const dept = await prisma.department.upsert({
    where: { name: 'SOC' },
    create: { name: 'SOC', description: 'Security Operations Center' },
    update: {}
  });

  const adminPassword = await bcrypt.hash('Admin#123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    create: {
      username: 'admin',
      email: 'admin@demo.local',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      departmentId: dept.id
    },
    update: { role: Role.ADMIN }
  });

  const asset = await prisma.asset.create({
    data: { name: 'Core Router', room: 'R-101', departmentId: dept.id }
  });

  const incident = await prisma.incident.create({
    data: {
      title: 'Phishing campaign',
      description: 'Multiple phishing emails reported by staff.',
      severity: IncidentSeverity.HIGH,
      departmentId: dept.id,
      assetId: asset.id,
      reporterId: admin.id
    }
  });

  await prisma.audit.create({
    data: {
      title: 'Quarterly phishing audit',
      status: AuditStatus.PLANNED,
      date: new Date(),
      departmentId: dept.id
    }
  });

  const vulnerability = await prisma.vulnerability.create({
    data: {
      title: 'Outdated firmware',
      cvss: 8.7,
      status: VulnerabilityStatus.OPEN,
      assetId: asset.id
    }
  });

  await prisma.mitigation.create({
    data: {
      title: 'Upgrade firmware',
      description: 'Apply latest security patches to network equipment',
      vulnerabilityId: vulnerability.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Seed completed', { incidentId: incident.id });
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
