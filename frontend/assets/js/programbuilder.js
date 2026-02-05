const API_URL = 'http://localhost:5000/api/program';
const token = localStorage.getItem('token');

async function loadProgram() {
  const res = await fetch(`${API_URL}/preview`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const papers = await res.json();
  const container = document.getElementById('programPreview');

  container.innerHTML = '';

  papers.forEach((paper, i) => {
    container.innerHTML += `
      <div style="margin-bottom:20px;">
        <h3>${i + 1}. ${paper.title}</h3>
        <p><strong>Authors:</strong>
          ${paper.authors.map(a => `${a.name} (${a.affiliation || 'N/A'})`).join(', ')}
        </p>
        <p>${paper.abstract}</p>
        <hr />
      </div>
    `;
  });
}

function downloadPDF() {
  window.open(`${API_URL}/download`, '_blank');
}

loadProgram();
