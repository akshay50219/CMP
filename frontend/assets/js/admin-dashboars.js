const API_URL = 'http://localhost:5000/api/admin';
const token = localStorage.getItem('token');

async function loadPapers() {
  const res = await fetch(`${API_URL}/papers`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const papers = await res.json();
  const table = document.getElementById('papersTable');
  table.innerHTML = '';

  papers.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.title}</td>
        <td>${p.status}</td>
        <td>${p.finalDecision}</td>
        <td>
          ${p.finalDecisionLocked
            ? 'Locked'
            : `<button onclick="decide('${p._id}', 'accept')">Accept</button>
               <button onclick="decide('${p._id}', 'reject')">Reject</button>`
          }
        </td>
      </tr>
    `;
  });
}

async function decide(paperId, decision) {
  await fetch(`${API_URL}/papers/${paperId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ decision })
  });

  loadPapers();
}

loadPapers();
