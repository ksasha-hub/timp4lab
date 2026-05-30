import { getApiError } from '../utils/getApiError';

export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div style={{ border: '1px solid #d33', padding: 12, marginBottom: 12, borderRadius: 8 }}>
      <div>{getApiError(error)}</div>
      {onRetry ? <button onClick={onRetry}>Retry</button> : null}
    </div>
  );
}
