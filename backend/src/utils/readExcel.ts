import * as xlsx from 'xlsx';
import * as path from 'path';
import { ExcelRow } from '../types';

export function readExcel(): ExcelRow[] {
  // Read from the new Excel file location
  const filePath = '/Users/ancy/Desktop/8byte.xlsx';
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json<ExcelRow>(sheet);
}

