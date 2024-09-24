import React, { useState, useEffect, useCallback } from 'react';
import { Form, Table } from 'react-bootstrap';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

function ErrorLogDetails() {
  const [errorTypes, setErrorTypes] = useState([]);
  const [selectedErrorType, setSelectedErrorType] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    fetchErrorTypes();
  }, []);

  const fetchErrorTypes = async () => {
    try {
      const response = await fetch('/api/all_error_types/');
      const data = await response.json();
      const sortedData = data.sort((a, b) => a.localeCompare(b, 'ja'));
      setErrorTypes(sortedData);
      if (sortedData.length > 0) {
        setSelectedErrorType(sortedData[0]);
      }
    } catch (error) {
      console.error('Error fetching error types:', error);
    }
  };

  const createNodesAndEdges = useCallback((errorType, index, details) => {
    if (!details[index]) return { nodes: [], edges: [] };
  
    const actions = details[index].actions_before_error.split(',');
    const baseNodeWidth = 200;
    const baseNodeHeight = 80;
    const horizontalGap = 100;
    const verticalGap = 120;
    const nodesPerRow = 5;
  
    const rows = [];
    let currentRow = [];
  
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const label = action.trim();
      const width = Math.max(baseNodeWidth, label.length * 10);
      const height = Math.max(baseNodeHeight, Math.ceil(label.length / 20) * 20);
  
      const node = {
        id: `action${i}`,
        data: { label },
        width,
        height,
        style: { 
          width, 
          height, 
          textAlign: 'center', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          fontSize: '14px',
          padding: '10px',
        },
      };
  
      currentRow.push(node);
  
      if (currentRow.length >= nodesPerRow) {
        rows.push({ nodes: currentRow });
        currentRow = [];
      }
    }
  
    if (currentRow.length > 0) {
      rows.push({ nodes: currentRow });
    }
  
    const errorLabel = errorType;
    const errorWidth = Math.max(baseNodeWidth, errorLabel.length * 10);
    const errorHeight = Math.max(baseNodeHeight, Math.ceil(errorLabel.length / 20) * 20);
  
    const errorNode = {
      id: 'error',
      data: { label: errorLabel },
      width: errorWidth,
      height: errorHeight,
      style: { 
        background: 'red', 
        color: 'white', 
        width: errorWidth, 
        height: errorHeight, 
        textAlign: 'center', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        fontSize: '14px',
        padding: '10px',
      },
    };
  
    rows.push({ nodes: [errorNode] });
  
    const nodes = [];
    let y = 0;
  
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const nodesInRow = row.nodes;
      let x = 0;
      let rowHeight = 0;
  
      for (let node of nodesInRow) {
        node.position = {
          x: x,
          y: y,
        };
        x += node.width + horizontalGap;
        rowHeight = Math.max(rowHeight, node.height);
        nodes.push(node);
      }
      y += rowHeight + verticalGap;
    }
  
    const edges = actions.map((_, i) => ({
      id: `edge-${i}`,
      source: `action${i}`,
      target: i === actions.length - 1 ? 'error' : `action${i + 1}`,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: 'arrowclosed' },
    }));
  
    return { nodes, edges };
  }, []);

  const fetchErrorDetails = useCallback(async (errorType) => {
    try {
      const response = await fetch(`/api/error_details/${errorType}/`);
      const data = await response.json();
      setErrorDetails(data);
      setCurrentIndex(0);
      if (data.length > 0) {
        const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(errorType, 0, data);
        setNodes(newNodes);
        setEdges(newEdges);
      }
    } catch (error) {
      console.error('Error fetching error details:', error);
    }
  }, [createNodesAndEdges, setNodes, setEdges]);

  useEffect(() => {
    if (selectedErrorType) {
      fetchErrorDetails(selectedErrorType);
    }
  }, [selectedErrorType, fetchErrorDetails]);

  const handleErrorTypeChange = (eventKey) => {
    setSelectedErrorType(eventKey);
    setCurrentIndex(0);
    fetchErrorDetails(eventKey);
    setTimeout(fitView, 0);
  };

  const handleNext = () => {
    const newIndex = Math.min(currentIndex + 1, errorDetails.length - 1);
    setCurrentIndex(newIndex);
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(selectedErrorType, newIndex, errorDetails);
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(fitView, 0);
  };

  const handleBack = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(selectedErrorType, newIndex, errorDetails);
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(fitView, 0);
  };

  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true });
    }
  }, [reactFlowInstance]);

  return (
    <div className="error-log-details">
      <h4>エラータイプを選択</h4>
      <Form.Select value={selectedErrorType} onChange={(e) => handleErrorTypeChange(e.target.value)}>
        {errorTypes.map((errorType) => (
          <option key={errorType} value={errorType}>
            {errorType}
          </option>
        ))}
      </Form.Select>
      <div className="mt-3">
        <div className="row justify-content-center mb-3">
          <div className="col-md-6">
            <Table striped bordered hover className="small-font-table">
              <tbody>
                <tr>
                  <th>ファイル名</th>
                  <td>{errorDetails[currentIndex]?.filename}</td>
                </tr>
                <tr>
                  <th>ユーザー名</th>
                  <td>{errorDetails[currentIndex]?.user_name}</td>
                </tr>
                <tr>
                  <th>画面名</th>
                  <td>{errorDetails[currentIndex]?.win_title}</td>
                </tr>
                <tr>
                  <th>発生回数</th>
                  <td>{errorDetails[currentIndex]?.occurrence_count}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
        <div style={{ height: '400px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onInit={setReactFlowInstance}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
              defaultZoom={0.5}
            >
              <Controls showInteractive={false} />
              <Background />
            </ReactFlow>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <button 
          className={`btn ${currentIndex === 0 ? 'btn-secondary' : 'btn-primary'} me-2`}
          onClick={handleBack} 
          disabled={currentIndex === 0}
        >
          前へ
        </button>
        <button 
          className={`btn ${currentIndex === errorDetails.length - 1 ? 'btn-secondary' : 'btn-primary'}`} 
          onClick={handleNext} 
          disabled={currentIndex === errorDetails.length - 1}
        >
          次へ
        </button>
      </div>
    </div>
  );
}

export default ErrorLogDetails;