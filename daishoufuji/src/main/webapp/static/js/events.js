// events.js - イベント機能

let allEvents = [];
let currentFilter = 'current';

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  await loadEvents();
});

async function loadEvents() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    allEvents = await response.json();
    filterEvents('current');

  } catch (error) {
    console.error('Error loading events:', error);
    document.getElementById('eventsContainer').innerHTML = 
      '<p style="text-align: center; color: var(--accent-color); padding: 2rem;">イベントの読み込みに失敗しました</p>';
  }
}

function filterEvents(status) {
  currentFilter = status;
  
  // ボタンのスタイルを更新
  document.querySelectorAll('.btn').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
  });
  event.target.classList.remove('btn-secondary');
  event.target.classList.add('btn-primary');

  const now = new Date();
  let filteredEvents = [];

  allEvents.forEach(evt => {
    const startDate = new Date(evt.startDate);
    const endDate = new Date(evt.endDate);

    if (status === 'current' && now >= startDate && now <= endDate) {
      filteredEvents.push({...evt, status: 'current'});
    } else if (status === 'upcoming' && now < startDate) {
      filteredEvents.push({...evt, status: 'upcoming'});
    } else if (status === 'ended' && now > endDate) {
      filteredEvents.push({...evt, status: 'ended'});
    }
  });

  displayEvents(filteredEvents);
}

function displayEvents(events) {
  const container = document.getElementById('eventsContainer');

  if (events.length === 0) {
    let message = 'イベントがありません';
    if (currentFilter === 'current') {
      message = '現在開催中のイベントはありません';
    } else if (currentFilter === 'upcoming') {
      message = '予定されているイベントはありません';
    } else if (currentFilter === 'ended') {
      message = '終了したイベントはありません';
    }
    
    container.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 2rem;">${message}</p>`;
    return;
  }

  const statusLabels = {
    current: '開催中',
    upcoming: '開催予定',
    ended: '終了'
  };

  container.innerHTML = events.map(event => `
    <div class="event-card">
      <div class="event-header">
        <div style="margin-bottom: 0.5rem;">
          <span class="event-badge ${event.status}">${statusLabels[event.status]}</span>
        </div>
        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${event.icon || '🎉'} ${event.title}</h3>
        <div style="opacity: 0.9; font-size: 0.95rem;">
          ${formatDate(event.startDate)} 〜 ${formatDate(event.endDate)}
        </div>
      </div>
      
      <div class="event-body">
        <p style="line-height: 1.8; color: var(--text-dark); margin-bottom: 1.5rem;">
          ${event.description}
        </p>

        ${event.goal ? `
          <div style="padding: 1rem; background: var(--light-bg); border-radius: var(--border-radius); margin-bottom: 1rem;">
            <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 0.5rem;">
              🎯 目標
            </div>
            <div style="font-size: 0.95rem;">${event.goal}</div>
          </div>
        ` : ''}

        ${event.reward ? `
          <div style="padding: 1rem; background: linear-gradient(135deg, #FFF8DC, #FFE4B5); border-radius: var(--border-radius); margin-bottom: 1rem;">
            <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 0.5rem;">
              🎁 報酬
            </div>
            <div style="font-size: 0.95rem;">${event.reward}</div>
          </div>
        ` : ''}

        ${event.status === 'current' ? `
          <div style="margin-top: 1.5rem;">
            <a href="running.html" class="btn btn-primary" style="width: 100%;">
              イベントに参加する
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}
