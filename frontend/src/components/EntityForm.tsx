import { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import type { EntityConfig } from '../types';

const toValue = (type: string, value: string) => {
  if (type === 'number') return Number(value);
  if (type === 'datetime-local') return value ? new Date(value).toISOString() : null;
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
  const initialForm = useMemo<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    config.fields.forEach((f) => {
      const raw = initial?.[f.name];
      base[f.name] = f.type === 'datetime-local' && typeof raw === 'string' && raw.includes('T')
        ? raw.slice(0, 16)
        : String(raw ?? '');
    });
    return base;
  }, [config.fields, initial]);

  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    config.fields.forEach((field) => {
      if (field.required && !form[field.name]?.trim()) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <Box
      component='form'
      onSubmit={(e) => {
        e.preventDefault();
        if (!validate()) return;
        const payload: Record<string, unknown> = {};
        config.fields.forEach((field) => {
          const raw = form[field.name];
          if (raw === '' && !field.required) return;
          payload[field.name] = toValue(field.type, raw);
        });
        setSubmitting(true);
        void onSubmit(payload).finally(() => setSubmitting(false));
      }}
    >
      <Stack spacing={2}>
        {config.fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type === 'select' ? 'text' : field.type}
            value={form[field.name] ?? ''}
            onChange={(e) => setForm((s) => ({ ...s, [field.name]: e.target.value }))}
            error={Boolean(errors[field.name])}
            helperText={errors[field.name] ?? ' '}
            required={field.required}
            fullWidth
            select={field.type === 'select'}
            slotProps={field.type === 'datetime-local' ? { inputLabel: { shrink: true } } : undefined}
          >
            {field.type === 'select'
              ? field.options?.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))
              : null}
          </TextField>
        ))}
        <Button type='submit' variant='contained' disabled={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
