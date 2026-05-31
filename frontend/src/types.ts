export type Role = 'ADMIN' | 'SUPERVISOR' | 'USER';

export type EntityConfig = {
  key: string;
  label: string;
  endpoint: string;
  searchableField?: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'datetime-local' | 'select';
    options?: string[];
    required?: boolean;
  }>;
};
