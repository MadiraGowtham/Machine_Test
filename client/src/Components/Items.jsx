import React from 'react';

function distributeTasks(tasks, agents) {
  const result = agents.map(agent => ({ ...agent, assignedTasks: [] }));

  tasks.forEach((task, idx) => {
    const agentIdx = idx % agents.length;
    result[agentIdx].assignedTasks.push(task);
  });

  return result;
}

function Items({ taskData, agentData, setAgentData }) {
  // taskData: [{ agent: { id, name }, tasks: [{ FirstName, Phone, Notes }] }]
  return (
    <div className="items-container">
      {taskData.map((item, idx) => (
        <div key={idx} className="agent-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="agent-name">Agent: {item.agent.name}</h3>
            <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>{item.tasks.length} tasks</span>
          </div>
          <div className="task-table-wrap">
            <table className="task-table">
              <thead>
                <tr>
                  <th>First name</th>
                  <th>Phone</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {item.tasks.map((task, tIdx) => (
                  <tr key={tIdx}>
                    <td>{task.FirstName}</td>
                    <td>{task.Phone}</td>
                    <td>{task.Notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Items;
