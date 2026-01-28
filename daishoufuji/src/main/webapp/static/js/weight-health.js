// weight-health.js - 体重・体調管理機能

let weightChart;

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 体調チェックフォーム
  document.getElementById('healthCheckForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await saveHealthCheck();
  });

  // 体重記録フォーム
  document.getElementById('weightForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await saveWeight();
  });

  // 初期グラフ表示（30日間）
  await loadWeightChart(30);
});

async function saveHealthCheck() {
  const token = localStorage.getItem('token');

  const healthStatus = document.querySelector('input[name="healthStatus"]:checked')?.value;
  if (!healthStatus) {
    alert('体調を選択してください');
    return;
  }

  const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked'))
    .map(cb => cb.value);

  const formData = {
    healthStatus: healthStatus,
    symptoms: symptoms,
    sleepHours: parseFloat(document.getElementById('sleepHours').value) || null,
    notes: document.getElementById('healthNotes').value
  };

  try {
    const response = await fetch('/api/health-check', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const result = await response.json();
      
      // AIからのアドバイスを表示
      if (result.advice) {
        const adviceDiv = document.getElementById('healthAdvice');
        const adviceText = document.getElementById('adviceText');
        
        adviceText.textContent = result.advice;
        adviceDiv.style.display = 'block';
      }

      document.getElementById('healthCheckForm').reset();
      alert('体調を記録しました!');
    } else {
      throw new Error('Failed to save health check');
    }
  } catch (error) {
    console.error('Error saving health check:', error);
    alert('記録に失敗しました');
  }
}

async function saveWeight() {
  const token = localStorage.getItem('token');

  const formData = {
    weight: parseFloat(document.getElementById('weight').value),
    bodyFat: parseFloat(document.getElementById('bodyFat').value) || null
  };

  try {
    const response = await fetch('/api/weight', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      document.getElementById('weightForm').reset();
      alert('体重を記録しました!');
      
      // グラフを更新
      await loadWeightChart(30);
    } else {
      throw new Error('Failed to save weight');
    }
  } catch (error) {
    console.error('Error saving weight:', error);
    alert('記録に失敗しました');
  }
}

async function loadWeightChart(days) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`/api/weight/history?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const weightData = await response.json();

    // 既存のチャートを破棄
    if (weightChart) {
      weightChart.destroy();
    }

    const ctx = document.getElementById('weightChart').getContext('2d');
    weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weightData.map(d => formatDate(d.date)),
        datasets: [
          {
            label: '体重 (kg)',
            data: weightData.map(d => d.weight),
            borderColor: '#4A90E2',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: '体脂肪率 (%)',
            data: weightData.map(d => d.bodyFat),
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1',
            hidden: !weightData.some(d => d.bodyFat)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(1);
                  label += context.dataset.label.includes('体重') ? ' kg' : ' %';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: '体重 (kg)'
            }
          },
          y1: {
            type: 'linear',
            display: weightData.some(d => d.bodyFat),
            position: 'right',
            title: {
              display: true,
              text: '体脂肪率 (%)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Error loading weight chart:', error);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}
