const API_URL = 'http://localhost:5000/api/author';
const token = localStorage.getItem('token');

/**
 * Submit paper
 */
document.getElementById('paperForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('abstract', abstract.value);
  formData.append('keywords', keywords.value);
  formData.append('paper', paperFile.files[0]);

  await fetch(`${API_URL}/papers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  loadPapers();
});

/**
 * Load submitted papers
 */
async function loadPapers() {
  const res = await fetch(`${API_URL}/papers`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const papers = await res.json();
  const table = document.getElementById('papersTable');
  table.innerHTML = '';

  papers.forEach(paper => {
    table.innerHTML += `
      <tr>
        <td>${paper.title}</td>
        <td>${paper.status}</td>
        <td>${paper.finalDecision}</td>
      </tr>
    `;
  });
}

loadPapers();
