import ExcelJS from 'exceljs';

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterKey =
  | 'all' | 'conduit' | 'dummy'
  | 'node' | 'reservoir' | 'junction' | 'surgeTank' | 'flowBoundary' | 'pump' | 'checkValve' | 'turbine';

type ColType = 'text' | 'number' | 'boolean' | 'dropdown';

interface ColDef {
  key: string;
  header: string;
  type: ColType;
  options?: string[];
  readOnly?: boolean;
  isLongList?: boolean; // lists too long for inline formula (>255 chars)
  width?: number;
}

// ─── Option lists ─────────────────────────────────────────────────────────────

const UNIT_OPTIONS    = ['SI', 'FPS'];
const PIPE_TYPE_OPTIONS = ['conduit', 'dummy'];
const BC_MODE_OPTIONS = ['fixed', 'schedule'];
const SURGE_TANK_TYPE_OPTIONS = ['SIMPLE', 'DIFFERENTIAL', 'AIRTANK'];
const PUMP_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE'];
const VALVE_STATUS_OPTIONS = ['OPEN', 'CLOSED'];
const TURBINE_MODE_OPTIONS = ['TURBINE', 'GENERATE', 'TURBGOV', 'EMERGENCY'];
const BOOL_OPTIONS = ['true', 'false'];

export const PIPE_MATERIAL_OPTIONS = [
  '-- None --',
  'Aluminum','Aluminum structural plate 32 in CR','Aluminum structural plate 32 in CR Historic',
  'Asbestos Cement','Asphalt ditch','Asphalt pavement (rough)','Asphalt pavement (smooth)',
  'Asphalted cast iron (new)','Bare soil','Best concrete','Brick in mortar','Brick sewer',
  'Cast iron','CMP','Concrete','Concrete (centrif. spun)','Concrete (steel forms)',
  'Concrete (wood forms)','Concrete gutter (broom finish)','Concrete gutter (troweled finish)',
  'Concrete gutter, asphalt pavement (rough)','Concrete gutter, asphalt pavement (smooth)',
  'Concrete pavement (float finish)','Copper','Curled wood mat','Ductile Iron',
  'Fiberglass roving','Flood plain, brush','Flood plain, cultivated','Galvanized iron',
  'Glass','Gravel riprap, 25 mm (1 in) D50','Gravel riprap, 50 mm (2 in) D50',
  'Grouted riprap','Jute net','Natural stream, clean','Natural stream, stony notes',
  'Natural stream, weedy','PVC','Riveted steel (new, rough)','Riveted steel (new, smooth)',
  'Rock cut','Rock riprap, 150 mm (6 in) D50','Rock riprap, 300 mm (12 in) D50',
  'Rough channel, with grass','Rough earth','Rough rocks','Soil cement','Steel',
  'Steel and Aluminum 18 In or less CR 3x1 Corrugations Historic',
  'Steel and Aluminum 5x1 and 3x1 Corrugations','Steel and Aluminum Var CR',
  'Steel and Aluminum Var CR Historic','Steel structural plate 18 In CR',
  'Steel structural plate 31 In CR','Steel structural plate 47 In CR',
  'Stone masonry','Stony bottom','Straw with net','Synthetic mat',
  'Very rough channel, with grass','Wood Stave (new, smooth)','Woven paper net',
];

// ─── Row-number sentinel ───────────────────────────────────────────────────────
// The '#' column is always first; it is read-only and never imported back.

const ROW_NUM_COL: ColDef = {
  key: '_rowNum', header: '#', type: 'number', readOnly: true, width: 5,
};

// ─── Column Definitions per Tab ───────────────────────────────────────────────

export const TAB_COLS: Record<FilterKey, ColDef[]> = {
  all: [
    ROW_NUM_COL,
    { key: '_unit',      header: 'Unit (SI/FPS)', type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',      header: 'Label',         type: 'text', width: 16 },
    { key: '_type',      header: 'Type',           type: 'text', readOnly: true, width: 14 },
    { key: 'type',       header: 'Pipe Type',      type: 'dropdown', options: PIPE_TYPE_OPTIONS, width: 14 },
    { key: 'nodeNumber', header: 'Node #',         type: 'number', width: 10 },
    { key: 'diameter',   header: 'Diameter',       type: 'number', width: 14 },
    { key: 'length',     header: 'Length',         type: 'number', width: 14 },
    { key: 'celerity',   header: 'Wave Speed',     type: 'number', width: 14 },
    { key: 'friction',   header: 'Friction',       type: 'number', width: 14 },
    { key: 'elevation',  header: 'Elevation',      type: 'number', width: 14 },
    { key: 'comment',    header: 'Comment',        type: 'text', width: 24 },
  ],
  conduit: [
    ROW_NUM_COL,
    { key: '_unit',              header: 'Unit (SI/FPS)',   type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',              header: 'Label',           type: 'text', width: 16 },
    { key: 'type',               header: 'Pipe Type',       type: 'dropdown', options: PIPE_TYPE_OPTIONS, width: 14 },
    { key: '_materialLabel',     header: 'Pipe Material',   type: 'dropdown', options: PIPE_MATERIAL_OPTIONS, isLongList: true, width: 32 },
    { key: 'length',             header: 'Length',          type: 'number', width: 14 },
    { key: 'diameter',           header: 'Diameter',        type: 'number', width: 14 },
    { key: 'celerity',           header: 'Wave Speed',      type: 'number', width: 14 },
    { key: 'friction',           header: 'Friction',        type: 'number', width: 14 },
    { key: 'manningsN',          header: "Manning's n",     type: 'number', width: 14 },
    { key: 'numSegments',        header: 'Segments',        type: 'number', width: 12 },
    { key: 'includeNumSegments', header: 'Incl. in INP',   type: 'dropdown', options: BOOL_OPTIONS, width: 14 },
    { key: 'hasAddedLoss',       header: 'Added Loss',      type: 'dropdown', options: BOOL_OPTIONS, width: 14 },
    { key: 'cplus',              header: 'CPLUS',           type: 'number', width: 12 },
    { key: 'cminus',             header: 'CMINUS',          type: 'number', width: 12 },
    { key: 'pipeE',              header: 'E (Modulus)',     type: 'number', width: 16 },
    { key: 'pipeWT',             header: 'WT (Wall Thick)', type: 'number', width: 16 },
    { key: 'variable',           header: 'VARIABLE',        type: 'dropdown', options: BOOL_OPTIONS, width: 14 },
    { key: 'distance',           header: 'Distance',        type: 'number', width: 14 },
    { key: 'area',               header: 'Area',            type: 'number', width: 14 },
    { key: 'comment',            header: 'Comment',         type: 'text', width: 24 },
  ],
  dummy: [
    ROW_NUM_COL,
    { key: '_unit',        header: 'Unit (SI/FPS)', type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',        header: 'Label',         type: 'text', width: 16 },
    { key: 'type',         header: 'Pipe Type',     type: 'dropdown', options: PIPE_TYPE_OPTIONS, width: 14 },
    { key: 'diameter',     header: 'Diameter',      type: 'number', width: 14 },
    { key: 'hasAddedLoss', header: 'Added Loss',    type: 'dropdown', options: BOOL_OPTIONS, width: 14 },
    { key: 'cplus',        header: 'CPLUS',         type: 'number', width: 12 },
    { key: 'cminus',       header: 'CMINUS',        type: 'number', width: 12 },
    { key: 'comment',      header: 'Comment',       type: 'text', width: 24 },
  ],
  node: [
    ROW_NUM_COL,
    { key: '_unit',      header: 'Unit (SI/FPS)', type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',      header: 'Label',         type: 'text', width: 16 },
    { key: '_type',      header: 'Type',           type: 'text', readOnly: true, width: 14 },
    { key: 'nodeNumber', header: 'Node #',         type: 'number', width: 10 },
    { key: 'elevation',  header: 'Elevation',      type: 'number', width: 14 },
    { key: 'comment',    header: 'Comment',        type: 'text', width: 24 },
  ],
  reservoir: [
    ROW_NUM_COL,
    { key: '_unit',              header: 'Unit (SI/FPS)',  type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',              header: 'Label',          type: 'text', width: 16 },
    { key: 'nodeNumber',         header: 'Node #',         type: 'number', width: 10 },
    { key: 'elevation',          header: 'Elevation',      type: 'number', width: 14 },
    { key: 'mode',               header: 'BC Mode',        type: 'dropdown', options: BC_MODE_OPTIONS, width: 16 },
    { key: 'reservoirElevation', header: 'Res. Elevation', type: 'number', width: 16 },
    { key: 'hScheduleNumber',    header: 'H Sched #',      type: 'number', width: 12 },
    { key: 'comment',            header: 'Comment',        type: 'text', width: 24 },
  ],
  junction: [
    ROW_NUM_COL,
    { key: '_unit',      header: 'Unit (SI/FPS)', type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',      header: 'Label',         type: 'text', width: 16 },
    { key: 'nodeNumber', header: 'Node #',         type: 'number', width: 10 },
    { key: 'elevation',  header: 'Elevation',      type: 'number', width: 14 },
    { key: 'comment',    header: 'Comment',        type: 'text', width: 24 },
  ],
  surgeTank: [
    ROW_NUM_COL,
    { key: '_unit',             header: 'Unit (SI/FPS)',  type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',             header: 'Label',          type: 'text', width: 16 },
    { key: 'nodeNumber',        header: 'Node #',          type: 'number', width: 10 },
    { key: 'elevation',         header: 'Elevation',       type: 'number', width: 14 },
    { key: 'type_st',           header: 'Tank Type',       type: 'dropdown', options: SURGE_TANK_TYPE_OPTIONS, width: 18 },
    { key: 'tankTop',           header: 'Top Elevation',   type: 'number', width: 14 },
    { key: 'tankBottom',        header: 'Bot. Elevation',  type: 'number', width: 14 },
    { key: 'initialWaterLevel', header: 'HTANK',           type: 'number', width: 12 },
    { key: 'riserDiameter',     header: 'Riser Diameter',  type: 'number', width: 16 },
    { key: 'riserTop',          header: 'Riser Top',       type: 'number', width: 14 },
    { key: 'hasShape',          header: 'Use SHAPE',       type: 'dropdown', options: BOOL_OPTIONS, width: 12 },
    { key: 'diameter',          header: 'Diameter',        type: 'number', width: 14 },
    { key: 'celerity',          header: 'Wave Speed',      type: 'number', width: 14 },
    { key: 'friction',          header: 'Friction',        type: 'number', width: 14 },
    { key: 'hasAddedLoss',      header: 'Added Loss',      type: 'dropdown', options: BOOL_OPTIONS, width: 14 },
    { key: 'cplus',             header: 'CPLUS',           type: 'number', width: 12 },
    { key: 'cminus',            header: 'CMINUS',          type: 'number', width: 12 },
    { key: 'comment',           header: 'Comment',         type: 'text', width: 24 },
  ],
  flowBoundary: [
    ROW_NUM_COL,
    { key: '_unit',          header: 'Unit (SI/FPS)', type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',          header: 'Label',         type: 'text', width: 16 },
    { key: 'nodeNumber',     header: 'Node #',         type: 'number', width: 10 },
    { key: 'scheduleNumber', header: 'Q Sched #',      type: 'number', width: 12 },
    { key: 'comment',        header: 'Comment',        type: 'text', width: 24 },
  ],
  pump: [
    ROW_NUM_COL,
    { key: '_unit',      header: 'Unit (SI/FPS)',  type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',      header: 'Label',          type: 'text', width: 16 },
    { key: 'nodeNumber', header: 'Node #',          type: 'number', width: 10 },
    { key: 'elevation',  header: 'Elevation',       type: 'number', width: 14 },
    { key: 'pumpStatus', header: 'Status',          type: 'dropdown', options: PUMP_STATUS_OPTIONS, width: 14 },
    { key: 'pumpType',   header: 'PCHAR Type #',    type: 'number', width: 14 },
    { key: 'rq',         header: 'RQ',              type: 'number', width: 12 },
    { key: 'rhead',      header: 'RHEAD',           type: 'number', width: 12 },
    { key: 'rspeed',     header: 'RSPEED (RPM)',    type: 'number', width: 14 },
    { key: 'rtorque',    header: 'RTORQUE',         type: 'number', width: 12 },
    { key: 'wr2',        header: 'WR2',             type: 'number', width: 12 },
    { key: 'comment',    header: 'Comment',         type: 'text', width: 24 },
  ],
  checkValve: [
    ROW_NUM_COL,
    { key: '_unit',       header: 'Unit (SI/FPS)',  type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',       header: 'Label',          type: 'text', width: 16 },
    { key: 'nodeNumber',  header: 'Node #',          type: 'number', width: 10 },
    { key: 'elevation',   header: 'Elevation',       type: 'number', width: 14 },
    { key: 'valveStatus', header: 'Status',          type: 'dropdown', options: VALVE_STATUS_OPTIONS, width: 14 },
    { key: 'valveDiam',   header: 'Valve Diameter',  type: 'number', width: 16 },
    { key: 'comment',     header: 'Comment',         type: 'text', width: 24 },
  ],
  turbine: [
    ROW_NUM_COL,
    { key: '_unit',           header: 'Unit (SI/FPS)',     type: 'dropdown', options: UNIT_OPTIONS, width: 14 },
    { key: 'label',           header: 'Label',             type: 'text', width: 16 },
    { key: 'nodeNumber',      header: 'Node #',             type: 'number', width: 10 },
    { key: 'elevation',       header: 'Elevation',          type: 'number', width: 14 },
    { key: 'turbineType',     header: 'TCHAR Type #',       type: 'number', width: 14 },
    { key: 'syncSpeed',       header: 'Sync Speed (RPM)',   type: 'number', width: 18 },
    { key: 'turbineDiameter', header: 'Diameter',           type: 'number', width: 14 },
    { key: 'wr2',             header: 'WR2',                type: 'number', width: 12 },
    { key: 'turbFriction',    header: 'Friction',           type: 'number', width: 14 },
    { key: 'windage',         header: 'Windage',            type: 'number', width: 12 },
    { key: 'operationMode',   header: 'Mode',               type: 'dropdown', options: TURBINE_MODE_OPTIONS, width: 16 },
    { key: 'vScheduleNumber', header: 'V Sched #',          type: 'number', width: 12 },
    { key: 'comment',         header: 'Comment',            type: 'text', width: 24 },
  ],
};

// ─── Material helpers ─────────────────────────────────────────────────────────

import { PIPE_MATERIALS, PIPE_MATERIALS_BY_ID } from './pipe-materials';

function materialLabelById(id: number | string | undefined): string {
  if (!id) return '-- None --';
  const m = PIPE_MATERIALS_BY_ID[Number(id)];
  return m ? m.label : '-- None --';
}

function materialIdByLabel(label: string): number | undefined {
  if (!label || label === '-- None --') return undefined;
  const m = PIPE_MATERIALS.find(m => m.label === label);
  return m?.id;
}

// ─── Cell value extractor ─────────────────────────────────────────────────────

function getRowValue(
  col: ColDef,
  data: Record<string, any>,
  subType: string,
  globalUnit: string,
  rowIdx: number,
): string | number {
  if (col.key === '_rowNum') return rowIdx + 1;
  if (col.key === '_type') {
    const LABELS: Record<string, string> = {
      reservoir: 'Reservoir', node: 'Node', junction: 'Junction',
      surgeTank: 'Surge Tank', flowBoundary: 'Flow BC',
      pump: 'Pump', checkValve: 'Check Valve', turbine: 'Turbine',
      conduit: 'Conduit', dummy: 'Dummy Pipe',
    };
    return LABELS[subType] ?? subType;
  }
  if (col.key === '_unit') return (data.unit as string) || globalUnit;
  if (col.key === '_materialLabel') return materialLabelById(data.materialId);
  const val = data[col.key];
  if (val === undefined || val === null) return '';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return val as string | number;
}

// ─── Styling constants ────────────────────────────────────────────────────────

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A73E8' },
};
const ROWNUM_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1557B0' },
};
const READONLY_FILL_EVEN: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' },
};
const READONLY_FILL_ODD: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' },
};
const DROPDOWN_FILL_EVEN: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF4FF' },
};
const DROPDOWN_FILL_ODD: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4EDFF' },
};
const NORMAL_FILL_EVEN: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' },
};
const NORMAL_FILL_ODD: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFF' },
};
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
const CELL_BORDER: Partial<ExcelJS.Borders> = {
  bottom: { style: 'hair', color: { argb: 'FFD1D5DB' } },
  right: { style: 'hair', color: { argb: 'FFD1D5DB' } },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export interface ExportRow {
  id: string;
  kind: 'edge' | 'node';
  subType: string;
  data: Record<string, any>;
}

export async function exportTabToExcel(
  filter: FilterKey,
  rows: ExportRow[],
  globalUnit: string,
  tabLabel: string,
): Promise<void> {
  const cols = TAB_COLS[filter];
  if (!cols) throw new Error(`Unknown filter: ${filter}`);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'WHAMO Network Designer';
  wb.created = new Date();

  // ── Hidden "Lists" sheet for long dropdowns (e.g. Pipe Material, 63 items) ──
  const longListCols = cols.filter(c => c.isLongList && c.options);
  const listsWs = wb.addWorksheet('_Lists');
  listsWs.state = 'hidden';

  // One column per long-list field; header = col key (used to build the formula ref)
  const listRanges: Record<string, string> = {};
  longListCols.forEach((col, i) => {
    const colLetter = String.fromCharCode(65 + i); // A, B, C…
    if (col.options) {
      col.options.forEach((opt, r) => {
        listsWs.getCell(`${colLetter}${r + 1}`).value = opt;
      });
      listRanges[col.key] = `_Lists!$${colLetter}$1:$${colLetter}$${col.options.length}`;
    }
  });

  // ── Main data sheet ──
  const ws = wb.addWorksheet(tabLabel, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Set column definitions
  ws.columns = cols.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width ?? Math.max(12, col.header.length + 4),
  }));

  // Style header row
  const headerRow = ws.getRow(1);
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const colDef = cols[colNumber - 1];
    cell.fill = colDef?.key === '_rowNum' ? ROWNUM_FILL : HEADER_FILL;
    cell.font = { ...HEADER_FONT, size: colDef?.key === '_rowNum' ? 9 : 10 };
    cell.alignment = { vertical: 'middle', horizontal: colDef?.key === '_rowNum' ? 'center' : 'left' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF1044A0' } } };
  });
  headerRow.height = 22;

  // Add a second "sub-header" hint row (light gray, italic)
  const hintRow = ws.addRow(cols.map(col => {
    if (col.key === '_rowNum') return '';
    if (col.readOnly) return '(read-only)';
    if (col.type === 'dropdown') return '▼ dropdown';
    if (col.type === 'number') return '123 numeric';
    return 'text';
  }));
  hintRow.eachCell({ includeEmpty: true }, cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5FB' } };
    cell.font = { italic: true, color: { argb: 'FF8899BB' }, size: 8 };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFCCD5E8' } } };
  });
  hintRow.height = 14;

  // ── Data rows (start at Excel row 3 because of hint row) ──
  rows.forEach((row, rowIdx) => {
    const isEven = rowIdx % 2 === 0;
    const values: (string | number)[] = cols.map(col =>
      getRowValue(col, row.data, row.subType, globalUnit, rowIdx)
    );
    const excelRow = ws.addRow(values);

    excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const colDef = cols[colNumber - 1];
      if (!colDef) return;

      const isReadOnly = !!colDef.readOnly;
      const isRowNum = colDef.key === '_rowNum';
      const isDropdown = colDef.type === 'dropdown' && !isReadOnly;
      const isNumeric = colDef.type === 'number' && !isReadOnly;

      // Fill colour
      if (isRowNum) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFE8F0FE' : 'FFD2E3FC' } };
      } else if (isReadOnly) {
        cell.fill = isEven ? READONLY_FILL_EVEN : READONLY_FILL_ODD;
      } else if (isDropdown) {
        cell.fill = isEven ? DROPDOWN_FILL_EVEN : DROPDOWN_FILL_ODD;
      } else {
        cell.fill = isEven ? NORMAL_FILL_EVEN : NORMAL_FILL_ODD;
      }

      // Font
      cell.font = {
        size: 10,
        color: { argb: isReadOnly ? 'FF888888' : 'FF1A1A2E' },
        bold: isRowNum,
      };

      // Alignment
      cell.alignment = {
        vertical: 'middle',
        horizontal: isRowNum || isNumeric ? 'center' : 'left',
      };

      cell.border = isRowNum
        ? { ...CELL_BORDER, right: { style: 'medium', color: { argb: 'FF1A73E8' } } }
        : CELL_BORDER;

      // ── Data validation ──

      // Dropdown: long list → reference sheet range; short list → inline formula
      if (isDropdown && colDef.options) {
        if (colDef.isLongList && listRanges[colDef.key]) {
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [listRanges[colDef.key]],
            error: 'Please select a value from the list.',
            errorTitle: 'Invalid Value',
            showErrorMessage: true,
          };
        } else {
          const formulaList = '"' + colDef.options.join(',') + '"';
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [formulaList],
            error: 'Please select a valid option.',
            errorTitle: 'Invalid Value',
            showErrorMessage: true,
          };
        }
      }

      // Number: decimal validation — rejects letters
      if (isNumeric) {
        cell.dataValidation = {
          type: 'decimal',
          operator: 'between',
          allowBlank: true,
          formulae: [-1e15, 1e15],
          error: 'This field only accepts numeric values. Please enter a number.',
          errorTitle: 'Numbers Only',
          showErrorMessage: true,
        };
      }

      // Protect read-only cells with a light lock appearance
      if (isReadOnly && !isRowNum) {
        cell.protection = { locked: true };
      }
    });

    excelRow.height = 18;
  });

  // ── Legend sheet ──
  const legendWs = wb.addWorksheet('Legend (do not edit)');
  legendWs.columns = [
    { header: 'Column', key: 'col', width: 28 },
    { header: 'Field Type', key: 'type', width: 16 },
    { header: 'Allowed Values / Notes', key: 'vals', width: 60 },
  ];
  const legendHeader = legendWs.getRow(1);
  legendHeader.eachCell(cell => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle' };
  });
  legendHeader.height = 20;

  cols.forEach(col => {
    const row = legendWs.addRow({
      col: col.header,
      type: col.readOnly ? 'Read-only'
          : col.type === 'dropdown' ? 'Dropdown'
          : col.type === 'number'   ? 'Number (decimal)'
          : 'Text',
      vals: col.readOnly
          ? 'Do not edit — informational only'
          : col.options
          ? col.options.slice(0, 10).join(', ') + (col.options.length > 10 ? ` … (${col.options.length} total)` : '')
          : col.type === 'number'
          ? 'Any numeric value (integers or decimals)'
          : 'Free text',
    });
    row.getCell('type').fill = col.readOnly
      ? READONLY_FILL_EVEN
      : col.type === 'dropdown'
      ? DROPDOWN_FILL_EVEN
      : NORMAL_FILL_EVEN;
    row.eachCell(cell => {
      cell.font = { size: 10 };
      cell.border = CELL_BORDER;
    });
    row.height = 16;
  });

  // ── Download ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whamo_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Import ───────────────────────────────────────────────────────────────────

export interface ImportUpdate {
  id: string;
  kind: 'edge' | 'node';
  data: Record<string, any>;
}

export async function importTabFromExcel(
  filter: FilterKey,
  rows: ExportRow[],
  globalUnit: string,
  file: File,
): Promise<{ updates: ImportUpdate[]; skipped: number; matched: number }> {
  const cols = TAB_COLS[filter];
  if (!cols) throw new Error(`Unknown filter: ${filter}`);

  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  // Find the first visible, non-legend, non-list sheet
  const ws = wb.worksheets.find(
    s => !s.name.startsWith('_') && !s.name.toLowerCase().includes('legend')
  );
  if (!ws) throw new Error('No data sheet found in workbook.');

  // Read header row (row 1) to build column index map
  const headerRow = ws.getRow(1);
  const headerMap: Record<string, number> = {};
  headerRow.eachCell((cell, colNum) => {
    const val = String(cell.value ?? '').trim();
    if (val) headerMap[val] = colNum;
  });

  // Build label → ExportRow lookup
  const labelLookup = new Map<string, ExportRow>();
  for (const row of rows) {
    const lbl = String(row.data.label ?? '').trim();
    if (lbl) labelLookup.set(lbl, row);
  }

  const updates: ImportUpdate[] = [];
  let skipped = 0;
  let matched = 0;

  const labelHeader = 'Label';
  const labelColNum = headerMap[labelHeader];

  ws.eachRow((excelRow, rowNum) => {
    // Skip header row (1) and hint row (2)
    if (rowNum <= 2) return;

    const labelCell = labelColNum ? excelRow.getCell(labelColNum) : null;
    const labelVal = String(labelCell?.value ?? '').trim();
    if (!labelVal) { skipped++; return; }

    const existingRow = labelLookup.get(labelVal);
    if (!existingRow) { skipped++; return; }

    matched++;
    const update: Record<string, any> = {};

    cols.forEach(col => {
      // Skip read-only cols and label (used only for matching)
      if (col.readOnly || col.key === 'label') return;
      const colNum = headerMap[col.header];
      if (!colNum) return;
      const cell = excelRow.getCell(colNum);
      const rawVal = cell.value;
      if (rawVal === null || rawVal === undefined || rawVal === '') return;
      const strVal = String(rawVal).trim();
      if (!strVal) return;

      if (col.key === '_unit') {
        if (strVal === 'SI' || strVal === 'FPS') update.unit = strVal;
        return;
      }

      if (col.key === '_materialLabel') {
        const matId = materialIdByLabel(strVal);
        if (matId !== undefined) {
          update.materialId = matId;
          const m = PIPE_MATERIALS_BY_ID[matId];
          if (m) {
            update.manningsN = m.manningsN;
            const unit: string = (existingRow.data.unit as string) || globalUnit;
            const eVal = unit === 'SI' ? m.youngsModulus_Pa : m.youngsModulus_psi;
            if (eVal > 0) update.pipeE = eVal;
          }
        } else {
          update.materialId = '';
        }
        return;
      }

      if (col.type === 'number') {
        const num = parseFloat(strVal);
        if (!isNaN(num)) update[col.key] = num;
        return;
      }

      if (col.type === 'dropdown' || col.type === 'text') {
        if (col.options && (col.options[0] === 'true' || col.options[1] === 'false')) {
          update[col.key] = strVal === 'true';
          return;
        }
        update[col.key] = strVal;
        return;
      }
    });

    updates.push({ id: existingRow.id, kind: existingRow.kind, data: update });
  });

  return { updates, skipped, matched };
}
