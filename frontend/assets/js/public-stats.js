const API_URL = 'http://localhost:5000/api/stats/public';

async function loadPublicStats() {
  const res = await fetch(API_URL);
  const data = await res.json();

  document.getElementById('summary').innerText =
    `Total Submissions: ${data.totalSubmissions} | Acceptance Rate: ${data.acceptanceRate}%`;

  const ctx = document.getElementById('publicChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Accepted', 'Rejected'],
      datasets: [{
        label: 'Papers',
        data: [data.accepted, data.rejected]
      }]
    }
  });
}

loadPublicStats();
