import React, { useState } from 'react';
import { agentAPI } from '../utils/api';

function Card({ data, setData }) {
  const [btnClick, setBtnClick] = useState(null);
  const [changeData, setChangeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (item) => {
    setBtnClick('edit');
    // Prefill all fields based on backend schema
    setChangeData({
      _id: item._id || item.id,
      name: item.name || '',
      email: item.email || '',
      // Normalize phone fields
      phone: item.phone || item.mobileNumber || '',
      mobileNumber: item.mobileNumber || item.phone || '',
      countryCode: item.countryCode || '+1',
      password: '' // never prefill password for security; allow optional update
    });
  };

  const handleDelete = (item) => {
    setBtnClick('delete');
    setChangeData(item);
  };

  const formUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await agentAPI.updateAgent(changeData._id, changeData);
      if (response.success) {
        // Merge server-updated agent back into list to ensure consistency
        const updatedAgent = response.data?.agent ? {
          ...response.data.agent,
          _id: response.data.agent._id || response.data.agent.id
        } : changeData;
        const updatedData = data.map(item => (item._id === updatedAgent._id || item._id === changeData._id) ? { ...item, ...updatedAgent } : item);
        setData(updatedData);
        setBtnClick(null);
        alert('Agent updated successfully');
      } else {
        alert(response.message || 'Error updating agent');
      }
    } catch (error) {
      alert('Error updating agent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formDelete = async () => {
    setLoading(true);
    try {
      const response = await agentAPI.deleteAgent(changeData._id);
      if (response.success) {
        const filteredData = data.filter(item => item._id !== changeData._id);
        setData(filteredData);
        setBtnClick(null);
        alert('Agent deleted successfully');
      } else {
        alert(response.message || 'Error deleting agent');
      }
    } catch (error) {
      alert('Error deleting agent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log('Card component received data:', data);
  
  return (
    <div className="card-list">
      {data && data.length > 0 ? data.map((item, idx) => (
        <div className="card" key={item._id || idx}>
          <div className="data">
            <h2>{item.name}</h2>
            <p>{item.email}</p>
            <p>{item.countryCode} {item.phone || item.mobileNumber}</p>
            <p>Status: {item.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <div className="card-btns">
            <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
            <button className="delete-btn" onClick={() => handleDelete(item)}>Delete</button>
          </div>
        </div>
      )) : <p>No agents found</p>}

      {btnClick === 'edit' && (
        <div className="modal-overlay" onClick={() => setBtnClick(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form className="edit-form" onSubmit={formUpdate}>
              <h2>Edit Data</h2>
              <input
                type="text"
                placeholder="Name"
                value={changeData.name}
                onChange={e => setChangeData({ ...changeData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Email"
                value={changeData.email}
                onChange={e => setChangeData({ ...changeData, email: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Country Code"
                  value={changeData.countryCode}
                  onChange={e => setChangeData({ ...changeData, countryCode: e.target.value })}
                  style={{ width: '100px' }}
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={changeData.phone}
                  onChange={e => setChangeData({ ...changeData, phone: e.target.value, mobileNumber: e.target.value })}
                  style={{ flex: 1 }}
                />
              </div>
              <input
              type='password'
              placeholder='Set new password (leave blank to keep current)'
              value={changeData.password}
              onChange={e => setChangeData({...changeData,password: e.target.value})}
              />
              <div className='form-btns'>
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Submit'}
                </button>
                <button type="button" onClick={() => setBtnClick(null)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {btnClick === 'delete' && (
        <div className="modal-overlay" onClick={() => setBtnClick(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="delete-form">
              <h2>Are you sure you want to delete this data?</h2>
              <button className="delete-btn" onClick={formDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Yes'}
              </button>
              <button className="cancel-btn" onClick={() => setBtnClick(null)} disabled={loading}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;
