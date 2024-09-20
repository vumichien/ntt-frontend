import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function UpdateDataModal({ show, handleClose, handleSave }) {
  const [updateDate, setUpdateDate] = useState('');
  const [aCount, setACount] = useState('');
  const [bCount, setBCount] = useState('');
  const [cCount, setCCount] = useState('');

  const onSave = () => {
    handleSave({ updateDate, aCount, bCount, cCount });
    setUpdateDate('');
    setACount('');
    setBCount('');
    setCCount('');
  };
  

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>データの更新</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label">日付:</label>
          <input 
            type="date" 
            className="form-control" 
            value={updateDate} 
            onChange={(e) => setUpdateDate(e.target.value)} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">ボタンA:</label>
          <input 
            type="number" 
            className="form-control" 
            value={aCount} 
            onChange={(e) => setACount(e.target.value)} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">ボタンB:</label>
          <input 
            type="number" 
            className="form-control" 
            value={bCount} 
            onChange={(e) => setBCount(e.target.value)} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">ボタンC:</label>
          <input 
            type="number" 
            className="form-control" 
            value={cCount} 
            onChange={(e) => setCCount(e.target.value)} 
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={onSave}>
          保存
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UpdateDataModal;
