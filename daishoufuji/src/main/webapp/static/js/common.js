// common.js - 共通ヘルパー関数とユーティリティ

// API基本URL（環境に応じて変更）
const API_BASE_URL = '/api';

// 共通のfetchラッパー（認証トークン自動付与）
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);
    
    // 401 Unauthorizedの場合は自動ログアウト
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = 'login.html';
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// 日付フォーマット関数
function formatDate(dateString, format = 'YYYY/MM/DD') {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD':
      return `${month}/${day}`;
    case 'YYYY/MM/DD HH:mm':
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    case 'HH:mm:ss':
      return `${hours}:${minutes}:${seconds}`;
    default:
      return `${year}/${month}/${day}`;
  }
}

// 相対時間表示（〇〇前）
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  if (weeks < 4) return `${weeks}週間前`;
  if (months < 12) return `${months}ヶ月前`;
  return `${years}年前`;
}

// 時間を秒数からHH:MM:SS形式に変換
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// 数値を3桁区切りでフォーマット
function formatNumber(num) {
  return num.toLocaleString('ja-JP');
}

// BMI計算
function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
}

// BMI判定
function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: '低体重', color: '#3498db' };
  if (bmi < 25) return { label: '普通体重', color: '#2ecc71' };
  if (bmi < 30) return { label: '肥満(1度)', color: '#f39c12' };
  if (bmi < 35) return { label: '肥満(2度)', color: '#e67e22' };
  if (bmi < 40) return { label: '肥満(3度)', color: '#e74c3c' };
  return { label: '肥満(4度)', color: '#c0392b' };
}

// 消費カロリー計算（簡易版）
function calculateCalories(distance, weight, duration) {
  // MET値（ランニング8.0とする）× 体重(kg) × 時間(h) × 1.05
  const met = 8.0;
  const hours = duration / 3600;
  const calories = met * weight * hours * 1.05;
  return Math.round(calories);
}

// ペース計算（分/km）
function calculatePace(distance, duration) {
  if (distance === 0) return '0:00';
  const paceMinutes = (duration / 60) / distance;
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.floor((paceMinutes - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// バリデーション: メールアドレス
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// バリデーション: パスワード強度チェック
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'パスワードは8文字以上で入力してください' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'パスワードに小文字を含めてください' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'パスワードに数字を含めてください' };
  }
  return { valid: true, message: '' };
}

// ローディング表示
function showLoading(element, message = '読み込み中...') {
  element.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--light-bg); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 1rem; color: var(--text-light);">${message}</p>
    </div>
  `;
  
  // スタイルが未定義の場合は追加
  if (!document.getElementById('loadingAnimation')) {
    const style = document.createElement('style');
    style.id = 'loadingAnimation';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// エラーメッセージ表示
function showError(element, message) {
  element.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
      <p style="color: var(--accent-color); font-weight: 600;">${message}</p>
    </div>
  `;
}

// トースト通知
function showToast(message, type = 'info', duration = 3000) {
  const colors = {
    success: 'var(--secondary-color)',
    error: 'var(--accent-color)',
    warning: '#FF9800',
    info: 'var(--primary-color)'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 0.8rem;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;

  toast.innerHTML = `
    <span style="font-size: 1.5rem;">${icons[type]}</span>
    <span>${message}</span>
  `;

  // アニメーション追加
  if (!document.getElementById('toastAnimation')) {
    const style = document.createElement('style');
    style.id = 'toastAnimation';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 確認ダイアログ（カスタムデザイン）
function showConfirm(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    max-width: 400px;
    width: 90%;
  `;

  dialog.innerHTML = `
    <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${message}</p>
    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
      <button id="cancelBtn" class="btn btn-secondary">キャンセル</button>
      <button id="confirmBtn" class="btn btn-primary">確認</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  document.getElementById('confirmBtn').addEventListener('click', () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  });

  document.getElementById('cancelBtn').addEventListener('click', () => {
    overlay.remove();
    if (onCancel) onCancel();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  });
}

// ローカルストレージのヘルパー
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// デバウンス関数（検索などで使用）
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// スロットル関数（スクロールイベントなどで使用）
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
