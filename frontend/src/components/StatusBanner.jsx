function StatusBanner({ type, message }) {
  if (!message) return null;
  return (
    <div className={`status-banner status-${type}`} role="alert">
      {message}
    </div>
  );
}

export default StatusBanner;