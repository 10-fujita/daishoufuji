// ai-selection.js - AIインストラクター選択機能

document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 現在の選択を取得して表示
  loadCurrentSelection();

  // すべてのAIカードにクリックイベントを追加
  document.querySelectorAll('.ai-card').forEach(card => {
    card.addEventListener('click', function() {
      const personality = this.dataset.personality;
      selectAI(personality);
    });
  });
});

async function loadCurrentSelection() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/user/ai-setting', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const currentPersonality = data.personality;

      // 現在選択されているカードをハイライト
      document.querySelectorAll('.ai-card').forEach(card => {
        if (card.dataset.personality === currentPersonality) {
          card.classList.add('selected');
        }
      });
    }
  } catch (error) {
    console.error('Error loading current AI selection:', error);
  }
}

async function selectAI(personality) {
  const token = localStorage.getItem('token');

  // すべてのカードから選択を解除
  document.querySelectorAll('.ai-card').forEach(card => {
    card.classList.remove('selected');
  });

  // 選択されたカードをハイライト
  const selectedCard = document.querySelector(`[data-personality="${personality}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  try {
    const response = await fetch('/api/user/ai-setting', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ personality })
    });

    if (response.ok) {
      // 成功メッセージを表示
      showSuccessMessage(personality);
      
      // 2秒後にダッシュボードへリダイレクト
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      throw new Error('Failed to update AI selection');
    }
  } catch (error) {
    console.error('Error selecting AI:', error);
    alert('AIインストラクターの選択に失敗しました。もう一度お試しください。');
  }
}

function showSuccessMessage(personality) {
  const messages = {
    gentle: '優しいトレーナーを選択しました!一緒に楽しく頑張りましょう♪',
    normal: 'バランス型トレーナーを選択しました!一緒に頑張りましょう!',
    strict: '厳しいトレーナーを選択しました!限界を超えていこう!',
    unique: 'ユニークトレーナーを選択しました!楽しい時間になるよ〜!'
  };

  const message = messages[personality] || 'インストラクターを選択しました!';

  // 成功メッセージを表示
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem 3rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    text-align: center;
    z-index: 10000;
    animation: fadeInScale 0.3s ease;
  `;
  messageDiv.innerHTML = `
    <div style="font-size: 4rem; margin-bottom: 1rem;">✨</div>
    <div style="font-size: 1.2rem; color: var(--primary-color); font-weight: 600;">
      ${message}
    </div>
  `;

  // アニメーションCSSを追加
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(messageDiv);

  // オーバーレイを追加
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
  `;
  document.body.appendChild(overlay);

  // 2秒後にメッセージを削除
  setTimeout(() => {
    messageDiv.remove();
    overlay.remove();
  }, 1800);
}
