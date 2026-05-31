import { Alert, Button, Stack } from '@mui/material';
import { getApiError } from '../utils/getApiError';

export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Alert
      severity='error'
      action={onRetry ? (
        <Button color='inherit' size='small' onClick={onRetry}>
          Retry
        </Button>
      ) : undefined}
      sx={{ mb: 2 }}
    >
      <Stack>{getApiError(error)}</Stack>
    </Alert>
  );
}
