import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import styled from 'styled-components';
import 'reactflow/dist/style.css';
import { FileText, Database, Settings, Users } from 'lucide-react';
import EncounterDocument from './encounters/EncounterDocument';

const ReactFlowWrapper = styled.div`
  width: 100%;
  height: 100%;
  
  .react-flow__node.selected {
    .react-flow__node-default,
    & > div {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 8px 24px rgba(0, 0, 0, 0.2) !important;
    }
  }
`;

const NodeContainer = styled.div<{ color?: string }>`
  padding: 20px;
  border-radius: 8px;
  background: white;
  border: 2px solid ${props => props.color || '#e5e7eb'};
  min-width: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const NodeTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NodeContent = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
`;

const IconWrapper = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${props => props.color || '#f3f4f6'};
`;

// Custom node component with handles for connections
function CustomNode({ data }: NodeProps) {
  const getIcon = () => {
    switch (data.icon) {
      case 'file':
        return <FileText size={16} />;
      case 'database':
        return <Database size={16} />;
      case 'settings':
        return <Settings size={16} />;
      case 'users':
        return <Users size={16} />;
      default:
        return null;
    }
  };

  return (
    <NodeContainer color={data.color}>
      {/* Connection handles - these allow nodes to be connected */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <NodeTitle>
        {data.icon && (
          <IconWrapper color={data.color}>
            {getIcon()}
          </IconWrapper>
        )}
        {data.label}
      </NodeTitle>
      {data.content && <NodeContent>{data.content}</NodeContent>}
    </NodeContainer>
  );
}

// Zone Node Component
const ZoneNodeContainer = styled.div<{ color?: string }>`
  width: 100%;
  height: 100%;
  border: 3px solid ${props => props.color || '#e5e7eb'};
  border-radius: 16px;
  background: ${props => props.color ? `${props.color}10` : 'transparent'};
  pointer-events: none;
  position: relative;
`;

const ZoneLabel = styled.div<{ color?: string }>`
  position: absolute;
  top: 16px;
  left: 16px;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.color || '#1f2937'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.color || '#e5e7eb'};
`;

function ZoneNode({ data }: NodeProps) {
  return (
    <ZoneNodeContainer color={data.color}>
      <ZoneLabel color={data.color}>{data.label}</ZoneLabel>
      {/* Zone 1 has handle at bottom, Zone 2 has handle at top */}
      {data.handlePosition === 'bottom' && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="bottom" 
          style={{ 
            width: 20, 
            height: 20, 
            background: data.color,
            border: '3px solid white'
          }} 
        />
      )}
      {data.handlePosition === 'top' && (
        <Handle 
          type="target" 
          position={Position.Top} 
          id="top" 
          style={{ 
            width: 20, 
            height: 20, 
            background: data.color,
            border: '3px solid white'
          }} 
        />
      )}
    </ZoneNodeContainer>
  );
}

// Encounter Document Node - wraps EncounterDocument
const EncounterNodeContainer = styled.div`
  width: 500px;
  height: 650px;
  background: transparent;
  border-radius: 16px;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
`;

function EncounterNode({ data }: NodeProps) {
  return (
    <EncounterNodeContainer>
      {/* Target handle on the left side for incoming connections */}
      <Handle type="target" position={Position.Left} id="left" />
      
      {/* Source handles on other sides for outgoing connections */}
      <Handle type="source" position={Position.Right} id="right" />
      
      <EncounterDocument patientData={data.patientData} />
    </EncounterNodeContainer>
  );
}

function Canvas3() {
  // Sample patient data for 6 encounters
  const createPatientData = (encounterNum: number) => ({
    patient: {
      name: 'Sarah Miller',
      sex: 'Female',
      date_of_birth: '1960-05-20',
      age_at_first_encounter: 55,
      identifiers: { mrn: 'MRN-2024-001' }
    },
    problem_list: [
      { name: 'Rheumatoid Arthritis', status: 'Active', first_recorded: '2015-08-10' },
      { name: 'Hypertension', status: 'Active', first_recorded: '2014-03-15' }
    ],
    encounters: [{
      encounter_no: `00${encounterNum}`,
      reason_for_visit: encounterNum === 1 ? 'Initial Consultation - Joint Pain' :
                        encounterNum === 2 ? 'Follow-up - RA Treatment Response' :
                        encounterNum === 3 ? 'Medication Adjustment' :
                        encounterNum === 4 ? 'Routine Follow-up' :
                        encounterNum === 5 ? 'Lab Review' :
                        'Annual Assessment',
      chief_complaint: encounterNum === 1 ? 'Bilateral joint pain and swelling' :
                       encounterNum === 2 ? 'Improved symptoms, some morning stiffness' :
                       encounterNum === 3 ? 'Persistent pain in hands' :
                       encounterNum === 4 ? 'Stable condition' :
                       encounterNum === 5 ? 'Review lab results' :
                       'Annual checkup',
      hpi: encounterNum === 1 ? '6-month history of progressive, symmetrical joint pain and swelling in hands and feet, worse in morning (>1h stiffness), with fatigue.' :
           encounterNum === 2 ? 'Patient reports 40% improvement in joint pain since starting methotrexate. Morning stiffness reduced to 30 minutes.' :
           encounterNum === 3 ? 'Despite treatment, patient continues to experience moderate pain in MCP joints. Considering biologic therapy.' :
           encounterNum === 4 ? 'Patient doing well on current regimen. Minimal joint pain, good functional status.' :
           encounterNum === 5 ? 'Reviewing recent lab work including inflammatory markers and liver function tests.' :
           'Annual comprehensive assessment of RA management and overall health.',
      meta: {
        date_time: encounterNum === 1 ? '2024-01-15T10:00:00' :
                   encounterNum === 2 ? '2024-03-20T14:30:00' :
                   encounterNum === 3 ? '2024-06-10T11:00:00' :
                   encounterNum === 4 ? '2024-09-05T09:30:00' :
                   encounterNum === 5 ? '2024-11-12T15:00:00' :
                   '2025-01-20T10:00:00',
        visit_type: 'Outpatient',
        provider: {
          name: 'Dr. Elizabeth Hayes',
          specialty: 'Rheumatology'
        },
        ui_risk_color: encounterNum <= 2 ? 'amber' : encounterNum <= 4 ? 'green' : 'green'
      },
      current_meds: encounterNum === 1 ? ['Ibuprofen 400mg PRN'] :
                    encounterNum === 2 ? ['Methotrexate 15mg weekly', 'Folic acid 1mg daily', 'Ibuprofen 400mg PRN'] :
                    encounterNum === 3 ? ['Methotrexate 20mg weekly', 'Folic acid 1mg daily', 'Adalimumab 40mg biweekly'] :
                    encounterNum === 4 ? ['Methotrexate 20mg weekly', 'Folic acid 1mg daily', 'Adalimumab 40mg biweekly'] :
                    encounterNum === 5 ? ['Methotrexate 20mg weekly', 'Folic acid 1mg daily', 'Adalimumab 40mg biweekly'] :
                    ['Methotrexate 20mg weekly', 'Folic acid 1mg daily', 'Adalimumab 40mg biweekly'],
      examination: {
        vitals: {
          bp_systolic: 128 + encounterNum,
          bp_diastolic: 82,
          hr_bpm: 72,
          rr_per_min: 16,
          temperature_c: 36.8,
          spo2: 98
        },
        general: 'Alert and oriented, no acute distress',
        musculoskeletal: encounterNum === 1 ? 'Swelling and tenderness in MCP and PIP joints bilaterally' :
                         encounterNum === 2 ? 'Reduced swelling, mild tenderness in MCP joints' :
                         encounterNum === 3 ? 'Moderate swelling in MCP joints, limited ROM' :
                         encounterNum === 4 ? 'Minimal swelling, good ROM' :
                         encounterNum === 5 ? 'No active synovitis' :
                         'Stable joint examination'
      },
      assessment: {
        impression: encounterNum === 1 ? 'Seropositive Rheumatoid Arthritis, active disease' :
                    encounterNum === 2 ? 'RA with partial response to methotrexate' :
                    encounterNum === 3 ? 'RA with inadequate response to methotrexate monotherapy' :
                    encounterNum === 4 ? 'RA well-controlled on combination therapy' :
                    encounterNum === 5 ? 'RA in remission, stable on current regimen' :
                    'RA in sustained remission',
        differential: encounterNum === 1 ? ['Psoriatic Arthritis', 'Systemic Lupus Erythematosus'] : []
      },
      plan: {
        investigations: {
          labs: encounterNum === 1 ? ['RF', 'Anti-CCP', 'ESR', 'CRP', 'CBC', 'CMP'] :
                encounterNum === 2 ? ['ESR', 'CRP', 'CBC', 'LFTs'] :
                encounterNum === 3 ? ['ESR', 'CRP', 'TB test', 'Hepatitis panel'] :
                encounterNum === 4 ? ['ESR', 'CRP', 'CBC', 'LFTs'] :
                encounterNum === 5 ? ['ESR', 'CRP', 'CBC', 'LFTs', 'Lipid panel'] :
                ['ESR', 'CRP', 'CBC', 'LFTs', 'HbA1c'],
          imaging: encounterNum === 1 ? ['Hand X-rays', 'Foot X-rays'] : []
        },
        management: {
          medications_started: encounterNum === 1 ? [{ name: 'Methotrexate', dose: '15mg', route: 'PO', frequency: 'weekly' }] :
                               encounterNum === 3 ? [{ name: 'Adalimumab', dose: '40mg', route: 'SC', frequency: 'biweekly' }] :
                               [],
          education: ['Disease management', 'Medication adherence', 'Joint protection techniques']
        }
      },
      next_review: encounterNum < 6 ? '6-8 weeks' : '3 months'
    }]
  });

  // Initial nodes - 2 zones with 6 encounters each
  const initialNodes: Node[] = [
    // Zone 1 - Background
    {
      id: 'zone-1',
      type: 'zone',
      position: { x: 50, y: 0 },
      data: { 
        label: 'Zone 1 - Patient Timeline',
        color: '#3b82f6',
        handlePosition: 'bottom'
      },
      style: { width: 3700, height: 950 },
      draggable: false,
      selectable: false,
      zIndex: -1,
    },
    
    // Zone 1 Encounters
    {
      id: 'encounter-1-1',
      type: 'encounter',
      position: { x: 100, y: 50 },
      data: { patientData: createPatientData(1) }
    },
    {
      id: 'encounter-1-2',
      type: 'encounter',
      position: { x: 700, y: 250 },
      data: { patientData: createPatientData(2) }
    },
    {
      id: 'encounter-1-3',
      type: 'encounter',
      position: { x: 1300, y: 50 },
      data: { patientData: createPatientData(3) }
    },
    {
      id: 'encounter-1-4',
      type: 'encounter',
      position: { x: 1900, y: 250 },
      data: { patientData: createPatientData(4) }
    },
    {
      id: 'encounter-1-5',
      type: 'encounter',
      position: { x: 2500, y: 50 },
      data: { patientData: createPatientData(5) }
    },
    {
      id: 'encounter-1-6',
      type: 'encounter',
      position: { x: 3100, y: 250 },
      data: { patientData: createPatientData(6) }
    },
    
    // Zone 2 - Background
    {
      id: 'zone-2',
      type: 'zone',
      position: { x: 50, y: 1050 },
      data: { 
        label: 'Zone 2 - Follow-up Timeline',
        color: '#10b981',
        handlePosition: 'top'
      },
      style: { width: 3700, height: 950 },
      draggable: false,
      selectable: false,
      zIndex: -1,
    },
    
    // Raw Data Consolidator Node - between zones
    {
      id: 'consolidator',
      type: 'custom',
      position: { x: 1750, y: 975 },
      data: {
        label: 'Raw Data Consolidator',
        content: 'Processing and consolidating data',
        color: '#f59e0b',
        icon: 'database'
      }
    },
    
    // Zone 2 Encounters
    {
      id: 'encounter-2-1',
      type: 'encounter',
      position: { x: 100, y: 1100 },
      data: { patientData: createPatientData(1) }
    },
    {
      id: 'encounter-2-2',
      type: 'encounter',
      position: { x: 700, y: 1300 },
      data: { patientData: createPatientData(2) }
    },
    {
      id: 'encounter-2-3',
      type: 'encounter',
      position: { x: 1300, y: 1100 },
      data: { patientData: createPatientData(3) }
    },
    {
      id: 'encounter-2-4',
      type: 'encounter',
      position: { x: 1900, y: 1300 },
      data: { patientData: createPatientData(4) }
    },
    {
      id: 'encounter-2-5',
      type: 'encounter',
      position: { x: 2500, y: 1100 },
      data: { patientData: createPatientData(5) }
    },
    {
      id: 'encounter-2-6',
      type: 'encounter',
      position: { x: 3100, y: 1300 },
      data: { patientData: createPatientData(6) }
    },
  ];

  // Initial edges - connecting encounters within zones and between zones
  const initialEdges: Edge[] = [
    // Zone 1 connections (1→2→3→4→5→6)
    {
      id: 'e1-1-2',
      source: 'encounter-1-1',
      sourceHandle: 'right',
      target: 'encounter-1-2',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 }
    },
    {
      id: 'e1-2-3',
      source: 'encounter-1-2',
      sourceHandle: 'right',
      target: 'encounter-1-3',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 3 }
    },
    {
      id: 'e1-3-4',
      source: 'encounter-1-3',
      sourceHandle: 'right',
      target: 'encounter-1-4',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 3 }
    },
    {
      id: 'e1-4-5',
      source: 'encounter-1-4',
      sourceHandle: 'right',
      target: 'encounter-1-5',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 3 }
    },
    {
      id: 'e1-5-6',
      source: 'encounter-1-5',
      sourceHandle: 'right',
      target: 'encounter-1-6',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 3 }
    },
    
    // Zone 2 connections (1→2→3→4→5→6)
    {
      id: 'e2-1-2',
      source: 'encounter-2-1',
      sourceHandle: 'right',
      target: 'encounter-2-2',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 }
    },
    {
      id: 'e2-2-3',
      source: 'encounter-2-2',
      sourceHandle: 'right',
      target: 'encounter-2-3',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 3 }
    },
    {
      id: 'e2-3-4',
      source: 'encounter-2-3',
      sourceHandle: 'right',
      target: 'encounter-2-4',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 3 }
    },
    {
      id: 'e2-4-5',
      source: 'encounter-2-4',
      sourceHandle: 'right',
      target: 'encounter-2-5',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 3 }
    },
    {
      id: 'e2-5-6',
      source: 'encounter-2-5',
      sourceHandle: 'right',
      target: 'encounter-2-6',
      targetHandle: 'left',
      type: 'default',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 3 }
    },
    
    // Connection from Zone 1 to Consolidator
    {
      id: 'e-zone1-to-consolidator',
      source: 'zone-1',
      sourceHandle: 'bottom',
      target: 'consolidator',
      type: 'default',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 6 }
    },
    
    // Connection from Consolidator to Zone 2
    {
      id: 'e-consolidator-to-zone2',
      source: 'consolidator',
      target: 'zone-2',
      targetHandle: 'top',
      type: 'default',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 6 }
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    encounter: EncounterNode,
    zone: ZoneNode,
  }), []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowWrapper>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      </ReactFlowWrapper>
    </div>
  );
}

export default Canvas3;
