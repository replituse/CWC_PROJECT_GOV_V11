import { Handle, Position, NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';
import damIcon from '@assets/dam_1779522984604.png';
import yIntersectionIcon from '@assets/y-intersection_(1)_1779523210044.png';
import waterTankIcon from '@assets/water-tank_(2)_1779523360829.png';
import waterPumpIcon from '@assets/water-pump_1779523451215.png';
import pipeIcon from '@assets/pipe_1779523475650.png';
import turbineImgIcon from '@assets/turbine_1779523517554.png';
import windIcon from '@assets/wind_1779523398812.png';

const HandleStyle = "w-2 h-2 bg-black border border-white opacity-0 group-hover:opacity-100 transition-opacity";
const CIRCLE_SIZE = 56;
const ICON_SIZE = 32;

function useNodeOrderError(id: string) {
  return useNetworkStore(state => state.nodeOrderErrorIds.includes(id));
}

// Detect which directions already have connections on this node,
// then return the first free direction for the label.
function useLabelPosition(nodeId: string): 'bottom' | 'top' | 'right' | 'left' {
  const edges = useNetworkStore(state => state.edges);
  const usedHandles = new Set<string>();
  edges.forEach(edge => {
    if (edge.source === nodeId) usedHandles.add(edge.sourceHandle || '');
    if (edge.target === nodeId) usedHandles.add(edge.targetHandle || '');
  });
  const hasBottom = usedHandles.has('s-bottom') || usedHandles.has('t-bottom');
  const hasTop    = usedHandles.has('s-top')    || usedHandles.has('t-top');
  const hasRight  = usedHandles.has('s-right')  || usedHandles.has('t-right');
  const hasLeft   = usedHandles.has('s-left')   || usedHandles.has('t-left');

  if (!hasBottom) return 'bottom';
  if (!hasRight)  return 'right';
  if (!hasTop)    return 'top';
  if (!hasLeft)   return 'left';
  return 'bottom';
}

function circleStyle(selected: boolean, hasOrderError: boolean): React.CSSProperties {
  return {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: '50%',
    border: `3px solid ${hasOrderError ? '#ef4444' : '#000'}`,
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    inset: 0,
    transition: 'all 0.15s',
    boxShadow: selected ? '0 0 0 3px rgba(0,0,0,0.15)' : undefined,
  };
}

// Build label style based on which direction is free
function labelStyle(pos: 'bottom' | 'top' | 'right' | 'left'): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    fontSize: 13,
    fontWeight: 700,
    color: '#000',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    userSelect: 'none',
    lineHeight: 1,
  };
  if (pos === 'bottom') return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 5 };
  if (pos === 'top')    return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 5 };
  if (pos === 'right')  return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 };
  return                        { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 };
}

const AllHandles = () => (
  <>
    <Handle type="target" id="t-top"    position={Position.Top}    className={HandleStyle} />
    <Handle type="source" id="s-top"    position={Position.Top}    className={HandleStyle} />
    <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
    <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
    <Handle type="target" id="t-left"   position={Position.Left}   className={HandleStyle} />
    <Handle type="source" id="s-left"   position={Position.Left}   className={HandleStyle} />
    <Handle type="target" id="t-right"  position={Position.Right}  className={HandleStyle} />
    <Handle type="source" id="s-right"  position={Position.Right}  className={HandleStyle} />
  </>
);

// Generic icon node with smart label placement
function SmartIconNode({
  nodeId, selected, hasOrderError, icon, label, alt,
}: {
  nodeId: string; selected: boolean; hasOrderError: boolean;
  icon: string; label: React.ReactNode; alt: string;
}) {
  const pos = useLabelPosition(nodeId);
  return (
    <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="group">
      <div style={circleStyle(selected, hasOrderError)}>
        <img src={icon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt={alt} />
      </div>
      <AllHandles />
      <span style={labelStyle(pos)}>{label}</span>
    </div>
  );
}

// Reservoir Node
export const ReservoirNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Reservoir Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={damIcon} label={data.label as React.ReactNode} alt="Reservoir" />
    </TooltipWrapper>
  );
});

// Basic Node (Simple Node) — text inside, no external label
export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Node Properties" />}>
      <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="group">
        <div style={circleStyle(!!selected, hasOrderError)}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
            N{data.nodeNumber as React.ReactNode}
          </span>
        </div>
        <AllHandles />
      </div>
    </TooltipWrapper>
  );
});

// Junction Node
export const JunctionNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Junction Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={yIntersectionIcon} label={`J${data.nodeNumber}`} alt="Junction" />
    </TooltipWrapper>
  );
});

// Surge Tank
export const SurgeTankNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Surge Tank Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={waterTankIcon} label={data.label as React.ReactNode} alt="Surge Tank" />
    </TooltipWrapper>
  );
});

// Pump Node
export const PumpNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Pump Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={waterPumpIcon} label={data.label as React.ReactNode} alt="Pump" />
    </TooltipWrapper>
  );
});

// Check Valve Node
export const CheckValveNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Check Valve Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={pipeIcon} label={data.label as React.ReactNode} alt="Check Valve" />
    </TooltipWrapper>
  );
});

// Turbine Node
export const TurbineNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Turbine Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={turbineImgIcon} label={data.label as React.ReactNode} alt="Turbine" />
    </TooltipWrapper>
  );
});

// Flow Boundary
export const FlowBoundaryNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Flow Boundary Properties" />}>
      <div
        className="group relative"
        style={{
          padding: '8px 14px',
          border: `2px solid ${hasOrderError ? '#ef4444' : '#000'}`,
          borderRadius: 6,
          background: 'white',
          boxShadow: selected ? '0 0 0 2px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 60,
        }}
      >
        <Handle type="target" id="t-top"    position={Position.Top}    className={HandleStyle} />
        <Handle type="source" id="s-top"    position={Position.Top}    className={HandleStyle} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="target" id="t-left"   position={Position.Left}   className={HandleStyle} />
        <Handle type="source" id="s-left"   position={Position.Left}   className={HandleStyle} />
        <Handle type="target" id="t-right"  position={Position.Right}  className={HandleStyle} />
        <Handle type="source" id="s-right"  position={Position.Right}  className={HandleStyle} />
        <img src={windIcon} style={{ width: 28, height: 28, objectFit: 'contain', pointerEvents: 'none' }} alt="Flow BC" />
        <div style={{ fontSize: 12, fontWeight: 700, color: '#000', lineHeight: 1 }}>
          {data.label as React.ReactNode}
        </div>
        <div style={{ fontSize: 10, color: '#333', lineHeight: 1 }}>
          Q-Sched: {data.scheduleNumber as React.ReactNode}
        </div>
      </div>
    </TooltipWrapper>
  );
});
