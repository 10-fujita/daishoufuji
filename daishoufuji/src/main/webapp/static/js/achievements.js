// achievements.js - 達成バッジ機能

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  await loadAchievements();
});

async function loadAchievements() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/achievements/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    displayAchievements(data);

  } catch (error) {
    console.error('Error loading achievements:', error);
    document.getElementById('achievementsList').innerHTML = 
      '<p style="text-align: center; color: var(--accent-color);">達成バッジの読み込みに失敗しました</p>';
  }
}

function displayAchievements(data) {
  const unlockedContainer = document.getElementById('unlockedAchievements');
  const lockedContainer = document.getElementById('lockedAchievements');
  const statsDiv = document.getElementById('achievementStats');

  // 統計情報を表示
  statsDiv.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div style="text-align: center;">
        <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary-color);">${data.unlocked}</div>
        <div style="color: var(--text-light); font-size: 0.9rem;">獲得済み</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-light);">${data.locked}</div>
        <div style="color: var(--text-light); font-size: 0.9rem;">未獲得</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2.5rem; font-weight: 700; color: var(--secondary-color);">${data.progress}%</div>
        <div style="color: var(--text-light); font-size: 0.9rem;">達成率</div>
      </div>
    </div>
  `;

  // 獲得済みバッジ
  if (data.unlockedAchievements.length === 0) {
    unlockedContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">まだバッジを獲得していません</p>';
  } else {
    unlockedContainer.innerHTML = data.unlockedAchievements.map(achievement => 
      createAchievementCard(achievement, true)
    ).join('');
  }

  // 未獲得バッジ
  if (data.lockedAchievements.length === 0) {
    lockedContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">全てのバッジを獲得しました！</p>';
  } else {
    lockedContainer.innerHTML = data.lockedAchievements.map(achievement => 
      createAchievementCard(achievement, false)
    ).join('');
  }
}

function createAchievementCard(achievement, unlocked) {
  const cardStyle = unlocked 
    ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;'
    : 'background: var(--light-bg); color: var(--text-light); opacity: 0.6;';

  const iconSize = unlocked ? '5rem' : '4rem';
  const dateInfo = unlocked && achievement.unlockedAt 
    ? `<div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">
         獲得日: ${formatDate(achievement.unlockedAt)}
       </div>`
    : '';

  const progressBar = !unlocked && achievement.progress !== undefined
    ? `<div style="margin-top: 1rem;">
         <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
           <span>進行度</span>
           <span style="font-weight: 600;">${achievement.current} / ${achievement.required}</span>
         </div>
         <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden;">
           <div style="width: ${achievement.progress}%; height: 100%; height: 100%; background: var(--secondary-color); transition: width 0.3s;"></div>
         </div>
       </div>`
    : '';

  return `
    <div style="${cardStyle} padding: 2rem; border-radius: var(--border-radius); text-align: center; transition: transform 0.3s; box-shadow: var(--shadow);"
         onmouseover="this.style.transform='translateY(-5px)'"
         onmouseout="this.style.transform='translateY(0)'">
      <div style="font-size: ${iconSize}; margin-bottom: 1rem;">
        ${unlocked ? achievement.icon : '🔒'}
      </div>
      <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">
        ${achievement.name}
      </h4>
      <p style="font-size: 0.9rem; line-height: 1.5; opacity: 0.9;">
        ${achievement.description}
      </p>
      ${dateInfo}
      ${progressBar}
      ${achievement.reward ? `
        <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(255,255,255,0.2); border-radius: 5px; font-size: 0.85rem;">
          🏆 報酬: ${achievement.reward}
        </div>
      ` : ''}
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}
