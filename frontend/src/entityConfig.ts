import type { EntityConfig } from './types';

export const entityConfig: Record<string, EntityConfig> = {
  users: {
    key: 'users',
    label: 'Users',
    endpoint: '/users',
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'text' },
      { name: 'role', label: 'Role', type: 'select', options: ['ADMIN', 'USER'], required: true }
    ]
  },
  departments: {
    key: 'departments',
    label: 'Departments',
    endpoint: '/departments',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text' }
    ]
  },
  assets: {
    key: 'assets',
    label: 'Assets',
    endpoint: '/assets',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'room', label: 'Room', type: 'text', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'number', required: true }
    ]
  },
  incidents: {
    key: 'incidents',
    label: 'Incidents',
    endpoint: '/incidents',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'severity', label: 'Severity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
      { name: 'departmentId', label: 'Department ID', type: 'number', required: true }
    ]
  },
  audits: {
    key: 'audits',
    label: 'Audits',
    endpoint: '/audits',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['PLANNED', 'IN_PROGRESS', 'DONE'], required: true },
      { name: 'date', label: 'Date', type: 'datetime-local', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'number', required: true }
    ]
  },
  vulnerabilities: {
    key: 'vulnerabilities',
    label: 'Vulnerabilities',
    endpoint: '/vulnerabilities',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'cvss', label: 'CVSS', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['OPEN', 'MITIGATED'], required: true },
      { name: 'assetId', label: 'Asset ID', type: 'number', required: true }
    ]
  },
  mitigations: {
    key: 'mitigations',
    label: 'Mitigations',
    endpoint: '/mitigations',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'vulnerabilityId', label: 'Vulnerability ID', type: 'number', required: true },
      { name: 'dueDate', label: 'Due Date', type: 'datetime-local' }
    ]
  }
};
