// notifications.js - 通知機能

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  await loadNotifications();

  // 全て既読にするボタン
  document.getElementById('markAllReadBtn').addEventListener('click', markAllAsRead);
});

async function loadNotifications() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const notifications = await response.json();
    
    const unread = notifications.filter(n => !n.isRead);
    const read = notifications.filter(n => n.isRead);

    displayUnreadNotifications(unread);
    displayReadNotifications(read);

  } catch (error) {
    console.error('Error loading notifications:', error);
    document.getElementById('unreadNotifications').innerHTML = 
      '<p style="text-align: center; color: var(--accent-color);">通知の読み込みに失敗しました</p>';
  }
}

function displayUnreadNotifications(notifications) {
  const container = document.getElementById('unreadNotifications');

  if (notifications.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">未読の通知はありません</p>';
    return;
  }

  container.innerHTML = notifications.map(notification => 
    createNotificationCard(notification, false)
  ).join('');
}

function displayReadNotifications(notifications) {
  const container = document.getElementById('readNotifications');

  if (notifications.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">既読の通知はありません</p>';
    return;
  }

  container.innerHTML = notifications.map(notification => 
    createNotificationCard(notification, true)
  ).join('');
}

function createNotificationCard(notification, isRead) {
  const typeIcons = {
    achievement: '🏆',
    event: '🎉',
    reminder: '⏰',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  const typeColors = {
    achievement: 'var(--secondary-color)',
    event: 'var(--primary-color)',
    reminder: '#FF9800',
    warning: 'var(--accent-color)',
    info: 'var(--primary-color)',
    success: 'var(--secondary-color)'
  };

  const icon = typeIcons[notification.type] || 'ℹ️';
  const borderColor = typeColors[notification.type] || 'var(--primary-color)';
  
  const opacity = isRead ? '0.6' : '1';
  const backgroundColor = isRead ? 'var(--light-bg)' : 'var(--white)';

  return `
    <div style="padding: 1.5rem; background: ${backgroundColor}; border-radius: var(--border-radius); margin-bottom: 1rem; border-left: 4px solid ${borderColor}; opacity: ${opacity}; transition: opacity 0.3s;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 2rem;">${icon}</span>
          <div>
            <h4 style="color: var(--text-dark); margin-bottom: 0.3rem; font-size: 1.1rem;">
              ${notification.title}
            </h4>
            <span style="color: var(--text-light); font-size: 0.85rem;">
              ${formatDateTime(notification.createdAt)}
            </span>
          </div>
        </div>
        ${!isRead ? `<button onclick="markAsRead(${notification.id})" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">既読にする</button>` : ''}
      </div>
      
      <p style="color: var(--text-dark); line-height: 1.6; margin-left: 3.5rem;">
        ${notification.message}
      </p>

      ${notification.actionUrl ? `
        <div style="margin-top: 1rem; margin-left: 3.5rem;">
          <a href="${notification.actionUrl}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem; display: inline-block;">
            ${notification.actionLabel || '詳細を見る'}
          </a>
        </div>
      ` : ''}
    </div>
  `;
}

async function markAsRead(notificationId) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      await loadNotifications();
    } else {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    alert('既読にできませんでした');
  }
}

async function markAllAsRead() {
  const token = localStorage.getItem('token');

  if (!confirm('全ての通知を既読にしますか？')) {
    return;
  }

  try {
    const response = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      await loadNotifications();
      alert('全ての通知を既読にしました');
    } else {
      throw new Error('Failed to mark all notifications as read');
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    alert('既読にできませんでした');
  }
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // 1分未満
  if (diff < 60000) {
    return 'たった今';
  }
  
  // 1時間未満
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分前`;
  }
  
  // 24時間未満
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}時間前`;
  }
  
  // それ以降は日付表示
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  return `${year}年${month}月${day}日 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
