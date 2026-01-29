// admin-dashboard.js - 管理者ダッシュボード機能

document.addEventListener('DOMContentLoaded', async function() {
  // 認証チェック
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'admin-login.html';
    return;
  }

  // ログアウト機能
  document.getElementById('adminLogoutBtn').addEventListener('click', function() {
    logout();
  });

  // データを読み込み
  await loadDashboardData();
});

async function loadDashboardData() {
  const token = localStorage.getItem('adminToken');

  try {
    // 管理者情報を取得
    const adminResponse = await fetch('/api/admin/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!adminResponse.ok) {
      throw new Error('Failed to fetch admin data');
    }

    const adminData = await adminResponse.json();
    document.getElementById('adminName').textContent = adminData.name;

    // 統計情報を取得
    await loadStatistics();

    // 最近のアクティビティを取得
    await loadRecentActivity();

    // 最近の不具合報告を取得
    await loadRecentBugReports();

  } catch (error) {
    console.error('Error loading dashboard:', error);
    if (error.message.includes('401')) {
      logout();
    }
  }
}

async function loadStatistics() {
  const token = localStorage.getItem('adminToken');

  try {
    const response = await fetch('/api/admin/statistics/summary', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const stats = await response.json();

    document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
    document.getElementById('activeUsers').textContent = stats.activeUsers.toLocaleString();
    document.getElementById('totalRunningRecords').textContent = stats.totalRunningRecords.toLocaleString();
    document.getElementById('totalBugReports').textContent = stats.pendingBugReports.toLocaleString();

  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

async function loadRecentActivity() {
  const token = localStorage.getItem('adminToken');

  try {
    const response = await fetch('/api/admin/activity/recent?limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const activities = await response.json();
    const container = document.getElementById('recentActivity');

    if (activities.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-light);">アクティビティはありません</p>';
      return;
    }

    container.innerHTML = activities.map(activity => {
      const activityIcons = {
        'user_registered': '👤',
        'running_completed': '🏃',
        'achievement_unlocked': '🏆',
        'event_participated': '🎉',
        'bug_reported': '🐛'
      };

      const icon = activityIcons[activity.type] || 'ℹ️';

      return `
        <div style="padding: 1rem; border-bottom: 1px solid #EEE; display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 1.5rem;">${icon}</span>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 0.3rem;">${activity.description}</div>
            <div style="font-size: 0.85rem; color: var(--text-light);">${formatDateTime(activity.createdAt)}</div>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading recent activity:', error);
  }
}

async function loadRecentBugReports() {
  const token = localStorage.getItem('adminToken');

  try {
    const response = await fetch('/api/admin/bug-reports/recent?limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const bugReports = await response.json();
    const container = document.getElementById('recentBugReports');

    if (bugReports.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-light);">不具合報告はありません</p>';
      return;
    }

    container.innerHTML = bugReports.map(report => {
      const severityColors = {
        critical: 'var(--accent-color)',
        high: '#FF9800',
        medium: '#FFC107',
        low: 'var(--text-light)'
      };

      const severityLabels = {
        critical: '緊急',
        high: '高',
        medium: '中',
        low: '低'
      };

      const statusLabels = {
        pending: '未対応',
        in_progress: '対応中',
        resolved: '解決済み',
        closed: 'クローズ'
      };

      return `
        <div style="padding: 1rem; border-bottom: 1px solid #EEE;">
          <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 0.5rem;">
            <div style="flex: 1;">
              <span style="background: ${severityColors[report.severity]}; color: white; padding: 0.2rem 0.6rem; border-radius: 3px; font-size: 0.75rem; font-weight: 600; margin-right: 0.5rem;">
                ${severityLabels[report.severity]}
              </span>
              <strong>${report.title}</strong>
            </div>
            <span style="color: var(--text-light); font-size: 0.85rem;">
              ${statusLabels[report.status]}
            </span>
          </div>
          <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">
            ${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-light); font-size: 0.85rem;">
              報告者: ${report.userName} | ${formatDateTime(report.createdAt)}
            </span>
            <a href="admin-bug-reports.html?id=${report.id}" style="color: var(--primary-color); text-decoration: none; font-size: 0.9rem;">
              詳細 →
            </a>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading recent bug reports:', error);
  }
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  return `${year}/${month}/${day} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminRole');
  window.location.href = 'admin-login.html';
}
