import { createBlankRow } from "../lib/helpers";

function EditableTable({ columns, rows, onCellChange, onAddRow, onAddColumn }) {
  return (
    <div className="table-shell">
      <div className="table-actions">
        <button type="button" onClick={onAddColumn}>
          Add Column
        </button>
        <button type="button" onClick={onAddRow}>
          Add Row
        </button>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1}>No rows available.</td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`}>
                      <input
                        value={row?.[column] ?? ""}
                        onChange={(event) =>
                          onCellChange(rowIndex, column, event.target.value)
                        }
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
