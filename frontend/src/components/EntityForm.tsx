import { useState } from 'react';
import type { EntityConfig } from '../types';

const toValue = (type: string, value: string) => {
  if (type === 'number') {
    return Number(value);
  }
  if (type === 'datetime-local') {
    return value ? new Date(value).toISOString() : null;
  }
  return value;
};

export function EntityForm({
  config,
  initial,
  onSubmit,
  submitLabel
}: {
  config: EntityConfig;
  initial?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    config.fields.forEach((f) => {
      base[f.name] = String(initial?.[f.name] ?? '');
    });
    return base;
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const payload: Record<string, unknown> = {};
        config.fields.forEach((field) => {
          const raw = form[field.name];
          if (raw === '' && !field.required) {
            return;
          }
          payload[field.name] = toValue(field.type, raw);
        });
        void onSubmit(payload);
      }}
      style={{ display: 'grid', gap: 8, marginBottom: 16 }}
    >
      {config.fields.map((field) => (
        <label key={field.name}>
          <div>{field.label}</div>
          {field.type === 'select' ? (
            <select
              value={form[field.name]}
              onChange={(e) => setForm((s) => ({ ...s, [field.name]: e.target.value }))}
              required={field.required}
            >
              <option value="">Select</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={form[field.name]}
              onChange={(e) => setForm((s) => ({ ...s, [field.name]: e.target.value }))}
              required={field.required}
            />
          )}
        </label>
      ))}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
