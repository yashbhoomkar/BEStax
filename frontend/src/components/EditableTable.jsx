function EditableTable({ columns, rows, onCellChange, onAddRow, onAddColumn }) {
  return (
    <div className="table-shell">
      <div className="table-actions">
        <button type="button" onClick={onAddColumn}>+ Column</button>
        <button type="button" onClick={onAddRow}>+ Row</button>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40, minWidth: 40 }}>#</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={(columns.length || 1) + 1} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No rows yet — click + Row to add one.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', userSelect: 'none' }}>
                    {rowIndex + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={`${rowIndex}-${col}`}>
                      <input
                        value={row?.[col] ?? ''}
                        onChange={(e) => onCellChange(rowIndex, col, e.target.value)}
                        aria-label={`Row ${rowIndex + 1}, ${col}`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EditableTable;