import { useState } from 'react';
import { X, BookOpen, Layers, Link2, Table2, FileSpreadsheet, Play, FileText, Keyboard, HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'getting-started',   icon: <BookOpen className="w-4 h-4" />,       label: 'Getting Started'     },
  { id: 'elements',          icon: <Layers className="w-4 h-4" />,          label: 'Network Elements'    },
  { id: 'connections',       icon: <Link2 className="w-4 h-4" />,           label: 'Connections'         },
  { id: 'flex-table',        icon: <Table2 className="w-4 h-4" />,          label: 'Flex Table'          },
  { id: 'excel',             icon: <FileSpreadsheet className="w-4 h-4" />, label: 'Excel Import/Export' },
  { id: 'simulation',        icon: <Play className="w-4 h-4" />,            label: 'Running Simulations' },
  { id: 'files',             icon: <FileText className="w-4 h-4" />,        label: 'INP & OUT Files'     },
  { id: 'shortcuts',         icon: <Keyboard className="w-4 h-4" />,        label: 'Keyboard Shortcuts'  },
  { id: 'troubleshooting',   icon: <HelpCircle className="w-4 h-4" />,      label: 'Troubleshooting'     },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] font-bold text-slate-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </h2>
  );
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] text-slate-500 mb-5 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </p>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-bold text-slate-800 mt-5 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] text-slate-600 leading-relaxed mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
      <span className="text-blue-500 flex-shrink-0 mt-0.5">ℹ</span>
      <p className="text-[12px] text-blue-800 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </p>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
      <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
      <p className="text-[12px] text-amber-900 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </p>
    </div>
  );
}

function ElementCard({ name, badge, desc, fields }: { name: string; badge: string; desc: string; fields?: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white mb-3 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', badge)}>{name}</span>
        <p className="text-[12px] text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{desc}</p>
      </div>
      {fields && fields.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-1.5">
          {fields.map(f => (
            <span key={f} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function KbRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-2 pr-4">
        <div className="flex items-center gap-1">
          {keys.map((k, i) => (
            <span key={i}>
              <kbd className="inline-block px-1.5 py-0.5 text-[11px] font-mono bg-slate-100 border border-slate-300 rounded shadow-sm">{k}</kbd>
              {i < keys.length - 1 && <span className="text-slate-400 text-[11px] mx-0.5">+</span>}
            </span>
          ))}
        </div>
      </td>
      <td className="py-2 text-[12px] text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{action}</td>
    </tr>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="list-none space-y-1.5 mb-3">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1a73e8] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
          <p className="text-[13px] text-slate-600 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{s}</p>
        </li>
      ))}
    </ol>
  );
}

// ─── Section content components ───────────────────────────────────────────────

function GettingStarted() {
  return (
    <>
      <SectionTitle>Getting Started</SectionTitle>
      <SectionLead>WHAMO Network Designer lets you visually build water distribution networks and export them for hydraulic simulation using the WHAMO engine.</SectionLead>

      <SubHeading>Creating a New Project</SubHeading>
      <StepList steps={[
        'Click New in the title bar to create a blank project.',
        'Enter a project name in the centre field of the title bar.',
        'Add elements using the INSERT ribbon (Reservoir, Node, Junction, etc.).',
        'Connect elements by hovering a node until the green handle appears, then dragging to another node.',
        'Click Save As to persist the project to the server.',
      ]} />

      <SubHeading>Opening an Existing Project</SubHeading>
      <StepList steps={[
        'Click Open in the title bar.',
        'Select a project from the Projects list panel.',
        'The canvas, properties, and all settings are restored automatically.',
      ]} />

      <SubHeading>Saving</SubHeading>
      <Para>Use <strong>Save</strong> to overwrite the current project, or <strong>Save As</strong> to create a new revision. Projects are stored on the server and remain available after logging out.</Para>

      <Note>All element property changes are tracked with Undo/Redo (up to 50 steps). Use <strong>Ctrl+Z</strong> and <strong>Ctrl+Y</strong> to navigate the history.</Note>
    </>
  );
}

function NetworkElements() {
  return (
    <>
      <SectionTitle>Network Elements</SectionTitle>
      <SectionLead>Each element in WHAMO represents a physical hydraulic component. Click any INSERT ribbon button to add an element to the canvas.</SectionLead>

      <ElementCard
        name="Reservoir"
        badge="bg-blue-600 text-white"
        desc="Fixed or schedule-driven hydraulic boundary. Provides a constant or time-varying head."
        fields={['Label', 'Elevation (m/ft)', 'Mode (Fixed/Schedule)', 'H-Schedule #', 'Loss coefficient']}
      />
      <ElementCard
        name="Node"
        badge="bg-slate-600 text-white"
        desc="Basic junction point in the network. Used wherever pipes meet without special behaviour."
        fields={['Label', 'Elevation (m/ft)', 'Node number']}
      />
      <ElementCard
        name="Junction"
        badge="bg-emerald-600 text-white"
        desc="Demand or tee junction with optional demand flow. Use for lateral off-takes."
        fields={['Label', 'Elevation', 'Demand (m³/s or ft³/s)']}
      />
      <ElementCard
        name="Surge Tank"
        badge="bg-purple-600 text-white"
        desc="Open or closed surge vessel. Models water-hammer suppression chambers."
        fields={['Label', 'Tank Top / Bottom', 'Initial Water Level', 'Riser Diameter', 'Area, Shape (E/A pairs)']}
      />
      <ElementCard
        name="Flow BC"
        badge="bg-orange-600 text-white"
        desc="Flow boundary condition. Injects or extracts a prescribed flow rate, optionally time-varying."
        fields={['Label', 'Flow rate (Q)', 'Mode', 'Q-Schedule #']}
      />
      <ElementCard
        name="Pump"
        badge="bg-pink-600 text-white"
        desc="Link element placed on a conduit to represent a pump. Requires a pump characteristic curve (P-Char)."
        fields={['Label', 'Speed ratio', 'Status (ON/OFF)', 'P-Char data']}
      />
      <ElementCard
        name="Check Valve"
        badge="bg-red-700 text-white"
        desc="Link element that only allows forward flow. Closes instantly when flow reverses."
        fields={['Label', 'Loss coefficient']}
      />
      <ElementCard
        name="Turbine"
        badge="bg-cyan-700 text-white"
        desc="Link element representing a hydraulic turbine. Supports TURBGOV and EMERGENCY closure modes."
        fields={['Label', 'Mode', 'Gate schedule (V-Schedule)', 'Speed, Inertia']}
      />

      <SubHeading>Conduits (Pipes)</SubHeading>
      <Para>Conduits are drawn automatically when you connect two elements. They carry flow between nodes. Key properties include length, diameter, celerity (wave speed), and friction factor.</Para>
      <Para><strong>Dummy pipes</strong> are zero-resistance conduits used to represent very short physical connections or to split long pipes.</Para>
    </>
  );
}

function Connections() {
  return (
    <>
      <SectionTitle>Connections (Conduits)</SectionTitle>
      <SectionLead>Every pair of connected elements is linked by a conduit. Drawing and editing conduits is the primary way to build your network topology.</SectionLead>

      <SubHeading>Drawing a Conduit</SubHeading>
      <StepList steps={[
        'Hover over any element node until a green connection handle appears on its edge.',
        'Click and drag from the handle to the target element.',
        'Release the mouse over the target — a conduit (pipe) is created automatically.',
        'The conduit appears in the Flex Table under the Conduit tab where you can set its properties.',
      ]} />

      <SubHeading>Pump / Check Valve / Turbine Links</SubHeading>
      <Para>To add a Pump, Check Valve, or Turbine between two nodes:</Para>
      <StepList steps={[
        'Click the Pump / Check Valve / Turbine button in the INSERT ribbon. The button turns blue to activate link-drawing mode.',
        'Hover over a source element and drag to a target element.',
        'The selected link type is created as a conduit with the special element type set.',
        'Click the active button again to cancel link-drawing mode.',
      ]} />

      <SubHeading>Conduit Properties</SubHeading>
      <Para>Select a conduit on the canvas to edit it in the Properties Panel on the right side. Key fields:</Para>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          ['Length (L)', 'Physical pipe length in m or ft'],
          ['Diameter (D)', 'Internal pipe diameter in m or ft'],
          ['Celerity (a)', 'Pressure-wave speed (m/s or ft/s)'],
          ['Friction (f)', "Darcy-Weisbach or Manning's friction"],
          ['Pipe Material', 'Auto-fills Manning\'s n, E, and computes celerity'],
          ['Has Added Loss', 'Enable a minor-loss coefficient'],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded border border-slate-200 px-2 py-1.5">
            <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{k}</p>
            <p className="text-[10px] text-slate-500" style={{ fontFamily: 'Poppins, sans-serif' }}>{v}</p>
          </div>
        ))}
      </div>

      <Note>When you select a Pipe Material from the dropdown, Manning's n, Young's Modulus (E), and wave speed (Celerity) are calculated automatically.</Note>
    </>
  );
}

function FlexTableSection() {
  return (
    <>
      <SectionTitle>Flex Table</SectionTitle>
      <SectionLead>The Flex Table gives you a spreadsheet-like view of every element in the network. Open it from Tools → Flex Table in the ribbon.</SectionLead>

      <SubHeading>Tab Filters</SubHeading>
      <Para>Use the filter chips at the top of the Flex Table to switch between element types: All, Conduit, Dummy Pipe, Reservoir, Node, Junction, Surge Tank, Flow BC, Pump, Check Valve, and Turbine.</Para>

      <SubHeading>Editing Cells</SubHeading>
      <Para>Click any white cell to edit it inline. Cells with a grey background are read-only for that element type. Press <kbd className="px-1 py-0.5 text-[11px] font-mono bg-slate-100 border border-slate-300 rounded shadow-sm">Tab</kbd> or <kbd className="px-1 py-0.5 text-[11px] font-mono bg-slate-100 border border-slate-300 rounded shadow-sm">Enter</kbd> to commit a change.</Para>

      <SubHeading>Unit System</SubHeading>
      <Para>The SI / FPS toggle at the top-right of the Flex Table controls the global display unit. Individual rows can override this via the <strong>Unit</strong> column — an amber border indicates a per-element override.</Para>

      <SubHeading>T/H and Q Schedule Pairs</SubHeading>
      <Para>For reservoirs with H-Schedule mode, or flow boundaries with Q-Schedule mode, click the <strong>Edit Pairs</strong> button in that row to open the pairs editor. Enter time/value pairs to define the schedule.</Para>

      <SubHeading>Pipe Material (Conduit Tab)</SubHeading>
      <Para>Selecting a material in the <strong>Material</strong> column auto-fills Manning's n, Pipe Elastic Modulus (E), and recalculates wave speed (Celerity) for all conduits where it's applied — or only the selected row depending on the <strong>Apply Material to All Conduits</strong> checkbox.</Para>

      <Note>Clicking a row in the Flex Table selects the corresponding element on the canvas (and vice versa), keeping both views in sync.</Note>
    </>
  );
}

function ExcelSection() {
  return (
    <>
      <SectionTitle>Excel Import / Export</SectionTitle>
      <SectionLead>The Flex Table supports lossless round-trip Excel synchronization. Export a workbook, edit values in Excel, and import back — all element data is preserved.</SectionLead>

      <SubHeading>Exporting a Single Element Type</SubHeading>
      <StepList steps={[
        'Open the Flex Table (Tools → Flex Table).',
        'Select the desired element type tab (e.g. Conduit).',
        'Click the Export Excel button in the top-right of the tab bar.',
        'An .xlsx file named whamo_conduit_YYYY-MM-DD.xlsx is downloaded.',
      ]} />

      <SubHeading>Exporting All Element Types (Multi-Sheet)</SubHeading>
      <StepList steps={[
        'Open the Flex Table and stay on the All tab.',
        'Click Export Excel — a multi-sheet workbook is created.',
        'Each element type with data gets its own clearly labelled sheet.',
        'The workbook is named whamo_all_<ProjectName>_YYYY-MM-DD.xlsx.',
      ]} />

      <SubHeading>Importing from Excel</SubHeading>
      <StepList steps={[
        'Make sure your network already contains the elements you want to update.',
        'Select the matching tab in the Flex Table (or All for a multi-sheet file).',
        'Click Import Excel and select the .xlsx file.',
        'Each row is matched by its Label. Rows whose labels do not match an existing element are skipped.',
        'After a multi-sheet import, a summary dialog shows updated/skipped counts per sheet.',
      ]} />

      <Warn>Import only updates existing elements — it does not create new ones. Make sure all elements exist on the canvas before importing.</Warn>
      <Note>The exported workbook includes Excel data-validation dropdowns for fields like Pipe Material, Mode, and boolean toggles. These dropdowns are preserved on re-import.</Note>

      <SubHeading>Import Summary</SubHeading>
      <Para>After a multi-sheet import, a summary dialog appears listing how many rows were updated and skipped in each sheet. You can use this to verify that all expected elements were matched correctly.</Para>
    </>
  );
}

function SimulationSection() {
  return (
    <>
      <SectionTitle>Running Simulations</SectionTitle>
      <SectionLead>WHAMO Network Designer can run the WHAMO hydraulic transient engine directly. Configure parameters, specify output requests, then generate your results.</SectionLead>

      <SubHeading>Computational Parameters</SubHeading>
      <Para>Click <strong>Analysis → Parameters</strong> in the ribbon to open the Computational Parameters sidebar. Configure:</Para>
      <div className="space-y-1.5 mb-3">
        {[
          ['Time Stages', 'Define DTCOMP (computation step), DTOUT (output interval), and TMAX (maximum time) for each simulation stage.'],
          ['Wavespeed', 'Global wave-speed option (automatically set from conduit celerity values).'],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="text-[12px] font-bold text-slate-800 flex-shrink-0" style={{ fontFamily: 'Poppins, sans-serif' }}>{k}:</span>
            <p className="text-[12px] text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{v}</p>
          </div>
        ))}
      </div>

      <SubHeading>Output Requests</SubHeading>
      <Para>Click <strong>Analysis → Configure</strong> to open the Output Requests panel. For each element or conduit you want output for:</Para>
      <StepList steps={[
        'Select a node or element from the dropdown, or choose a group type (Nodes, Conduits, Elements).',
        'Tick the variables you want: Q, HEAD, ELEV, VEL, PRESS, PIEZHEAD (or Q, HEAD, SPEED, POWER for turbines).',
        'Click Add Request (or Add All for Group). History, Plot, and Spreadsheet request types are added simultaneously.',
        'Review the Current Requests list at the bottom.',
      ]} />

      <SubHeading>Generating the .OUT File</SubHeading>
      <StepList steps={[
        'Click Generate → .OUT in the ribbon.',
        'The network is validated. If there are errors, fix them and try again.',
        'After validation, the WHAMO engine runs on the server and the .OUT file is generated.',
        'The result is displayed in the file preview panel — you can also send it directly to Visualization.',
      ]} />

      <Note>The WHAMO engine requires Wine on Linux. It runs in an isolated temporary directory and cleans up after each run.</Note>
    </>
  );
}

function FilesSection() {
  return (
    <>
      <SectionTitle>INP & OUT Files</SectionTitle>
      <SectionLead>WHAMO uses two text-based file formats: the .INP input file and the .OUT output file. Both can be previewed, downloaded, and analysed within the Designer.</SectionLead>

      <SubHeading>.INP File</SubHeading>
      <Para>The .INP file is the WHAMO input definition. It describes the network topology, element properties, computational parameters, and output requests in WHAMO's native format.</Para>
      <Para>To generate an .INP file:</Para>
      <StepList steps={[
        'Click Generate → .INP in the ribbon.',
        'The network is validated first. Resolve any errors shown in the Validation dialog.',
        'After validation, confirm the output requests in the Configure panel, then click Generate .INP.',
        'The file is downloaded to your computer.',
      ]} />
      <Para>You can also load an existing .INP file into the canvas using the INP Parser (if your workflow requires reverse-engineering an existing file — contact your administrator).</Para>

      <SubHeading>.OUT File</SubHeading>
      <Para>The .OUT file is produced by the WHAMO engine after a simulation run. It contains time-series results for all requested output variables.</Para>
      <Para>To view .OUT results in the Visualization tool:</Para>
      <StepList steps={[
        'Click Tools → Visualization in the ribbon.',
        'Load a .OUT file using the file picker inside the Visualization view.',
        'Switch between Profile Graph (animated HGL) and History Graph (time-series plots).',
      ]} />

      <Note>The .OUT file parser runs entirely client-side — no server upload is needed to view results.</Note>
    </>
  );
}

function ShortcutsSection() {
  return (
    <>
      <SectionTitle>Keyboard Shortcuts</SectionTitle>
      <SectionLead>Use these shortcuts to speed up common actions while working in the canvas or Flex Table.</SectionLead>

      <SubHeading>Canvas</SubHeading>
      <table className="w-full mb-4 text-[12px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <thead>
          <tr className="bg-slate-50 rounded-t-lg">
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide pr-4">Shortcut</th>
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody>
          <KbRow keys={['Ctrl', 'Z']} action="Undo last change" />
          <KbRow keys={['Ctrl', 'Y']} action="Redo" />
          <KbRow keys={['Ctrl', 'S']} action="Save project" />
          <KbRow keys={['Delete']} action="Delete selected element(s)" />
          <KbRow keys={['Escape']} action="Deselect / cancel link-drawing mode" />
          <KbRow keys={['Ctrl', 'A']} action="Select all elements on canvas" />
          <KbRow keys={['Ctrl', '+']} action="Zoom in" />
          <KbRow keys={['Ctrl', '-']} action="Zoom out" />
          <KbRow keys={['Ctrl', 'Shift', 'F']} action="Fit view to network" />
          <KbRow keys={['Space']} action="Pan canvas (hold while dragging)" />
        </tbody>
      </table>

      <SubHeading>Flex Table</SubHeading>
      <table className="w-full mb-4 text-[12px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide pr-4">Shortcut</th>
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody>
          <KbRow keys={['Tab']} action="Move to next editable cell" />
          <KbRow keys={['Shift', 'Tab']} action="Move to previous editable cell" />
          <KbRow keys={['Enter']} action="Commit edit and move to next row" />
          <KbRow keys={['Escape']} action="Cancel edit without saving" />
        </tbody>
      </table>

      <SubHeading>Canvas Controls (ReactFlow)</SubHeading>
      <table className="w-full mb-4 text-[12px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide pr-4">Control</th>
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody>
          <KbRow keys={['Scroll Wheel']} action="Zoom in / out on canvas" />
          <KbRow keys={['Click + Drag (background)']} action="Pan canvas" />
          <KbRow keys={['Click + Drag (node)']} action="Move element" />
          <KbRow keys={['Click (node)']} action="Select element, show Properties Panel" />
        </tbody>
      </table>
    </>
  );
}

function TroubleshootingSection() {
  return (
    <>
      <SectionTitle>Troubleshooting</SectionTitle>
      <SectionLead>Common issues and how to resolve them.</SectionLead>

      {[
        {
          q: 'Validation fails with "No path from Reservoir to Node"',
          a: 'Every node that is part of the simulation must be reachable from at least one Reservoir via conduits. Check the canvas for disconnected elements or broken conduit connections.',
        },
        {
          q: 'WHAMO engine returns an error or empty .OUT file',
          a: 'Ensure all conduit lengths, diameters, and celerities are non-zero. Check that DTCOMP × celerity / length ≤ 1 (Courant condition). Review the error message in the preview panel for WHAMO-specific diagnostics.',
        },
        {
          q: 'Import Excel: all rows skipped',
          a: 'The import matches rows by Label. Ensure the Label column in your Excel file matches exactly the element labels on the canvas (case-sensitive). Use Export Excel first to get the correct format.',
        },
        {
          q: 'Multi-sheet export shows empty workbook',
          a: 'The All tab export only includes element types that have at least one element. Make sure your network has elements before exporting.',
        },
        {
          q: 'Canvas elements overlap after Auto-Arrange',
          a: 'Auto-Arrange uses a tree layout algorithm and works best on networks with a clear flow direction (left to right). For complex looped networks, manually position elements after arranging.',
        },
        {
          q: 'Surge Tank celerity is very high or infinite',
          a: "Surge tanks are modelled as infinite-celerity elements in WHAMO. This is expected — do not adjust the celerity for surge tank connections.",
        },
        {
          q: 'Undo/Redo is not available',
          a: 'Undo/Redo is only available when a project is open. Make sure you have opened or saved a project first.',
        },
      ].map(({ q, a }) => (
        <div key={q} className="mb-4 rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-start gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
            <ChevronRight className="w-3.5 h-3.5 text-[#1a73e8] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{q}</p>
          </div>
          <p className="text-[12px] text-slate-600 px-3 py-2.5 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{a}</p>
        </div>
      ))}
    </>
  );
}

const SECTION_CONTENT: Record<string, React.ReactNode> = {
  'getting-started':  <GettingStarted />,
  'elements':         <NetworkElements />,
  'connections':      <Connections />,
  'flex-table':       <FlexTableSection />,
  'excel':            <ExcelSection />,
  'simulation':       <SimulationSection />,
  'files':            <FilesSection />,
  'shortcuts':        <ShortcutsSection />,
  'troubleshooting':  <TroubleshootingSection />,
};

// ─── HelpModal ────────────────────────────────────────────────────────────────
export function HelpModal({ open, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState('getting-started');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex"
      data-testid="help-modal"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative flex w-full h-full bg-white shadow-2xl overflow-hidden">

        {/* ── Left sidebar ── */}
        <aside className="w-[220px] flex-shrink-0 flex flex-col bg-slate-900 text-white">
          <div className="px-4 py-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-[13px] font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>User Guide</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">WHAMO Network Designer</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                data-testid={`help-nav-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors text-[12px]',
                  activeSection === sec.id
                    ? 'bg-[#1a73e8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium',
                )}
              >
                <span className="flex-shrink-0 opacity-75">{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0">
            <p className="text-[10px] text-slate-500">v1.0 — WHAMO ND</p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{SECTIONS.find(s => s.id === activeSection)?.icon}</span>
              <span className="text-[13px] font-semibold text-slate-700">
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </span>
            </div>
            <button
              onClick={onClose}
              data-testid="help-modal-close"
              className="p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#fafbfc]">
            <div className="max-w-3xl">
              {SECTION_CONTENT[activeSection]}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
