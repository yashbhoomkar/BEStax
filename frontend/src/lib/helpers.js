import * as XLSX from "xlsx";

import { MANDATORY_DATASET_COLUMNS } from "./constants";

export function createBlankRow(columns) {
  const row = {};
  columns.forEach((column) => {
    row[column] = "";
  });
  return row;
}

export function normalizeRows(rows, columns) {
  return rows.map((row) => {
    const normalized = {};
    columns.forEach((column) => {
      normalized[column] = row?.[column] ?? "";
    });
    return normalized;
  });
}

export function computeProjectScore(rows, evaluatorNames) {
  const numericValues = [];
  rows.forEach((row) => {
    evaluatorNames.forEach((evaluatorName) => {
      const value = Number(row?.[evaluatorName]);
      if (!Number.isNaN(value)) {
        numericValues.push(value);
      }
    });
  });

  if (numericValues.length === 0) {
    return "";
  }

  const average =
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
  return average.toFixed(2);
}

export async function parseExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const missingColumns = MANDATORY_DATASET_COLUMNS.filter((column) => !columns.includes(column));

  return {
    name: file.name.replace(/\.[^.]+$/, ""),
    columns,
    rows,
    missingColumns
  };
}
