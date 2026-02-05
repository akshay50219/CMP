const API_URL = 'http://localhost:5000/api/stats/admin';
const token = localStorage.getItem('token');

async function loadStats() {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  const ctx = document.getElementById('decisionChart');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Accepted', 'Rejected'],
      datasets: [{
        data: [data.accepted, data.rejected]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Acceptance Rate: ${data.acceptanceRate}%`
        }
      }
    }
  });
}

loadStats();
