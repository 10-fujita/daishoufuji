// meal.js - 食事記録機能

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 今日の食事を読み込み
  await loadTodayMeals();

  // フォーム送信
  document.getElementById('mealForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      mealType: document.getElementById('mealType').value,
      foodName: document.getElementById('foodName').value,
      calories: document.getElementById('calories').value || null,
      notes: document.getElementById('notes').value
    };

    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // AIがカロリーを推定した場合
        if (result.estimatedCalories) {
          alert(`カロリーをAIが推定しました: ${result.estimatedCalories} kcal`);
        }

        // フォームをリセット
        this.reset();

        // 食事リストを更新
        await loadTodayMeals();

        alert('食事を記録しました!');
      } else {
        throw new Error('Failed to save meal');
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('記録に失敗しました。もう一度お試しください。');
    }
  });
});

async function loadTodayMeals() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/meals/today', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    const meals = data.meals;
    const totalCalories = data.totalCalories;
    const targetCalories = data.targetCalories;

    // 総カロリー表示
    document.getElementById('todayCalories').textContent = totalCalories;
    document.getElementById('targetCalories').textContent = targetCalories;

    // 食事リスト表示
    const container = document.getElementById('todayMeals');

    if (meals.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-light);">まだ記録がありません</p>';
      return;
    }

    const mealTypeLabels = {
      breakfast: '朝食',
      lunch: '昼食',
      dinner: '夕食',
      snack: '間食'
    };

    container.innerHTML = meals.map(meal => `
      <div style="padding: 1rem; border-bottom: 1px solid #EEE; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 600; margin-bottom: 0.3rem;">
            <span style="color: var(--primary-color);">${mealTypeLabels[meal.mealType]}</span>
            - ${meal.foodName}
          </div>
          <div style="font-size: 0.9rem; color: var(--text-light);">
            ${meal.calories} kcal
            ${meal.notes ? `<br>${meal.notes}` : ''}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 0.3rem;">
            ${formatTime(meal.recordedAt)}
          </div>
        </div>
        <button onclick="deleteMeal(${meal.id})" style="background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">
          削除
        </button>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading meals:', error);
  }
}

async function deleteMeal(mealId) {
  if (!confirm('この記録を削除しますか?')) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`/api/meals/${mealId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      await loadTodayMeals();
      alert('削除しました');
    } else {
      throw new Error('Failed to delete meal');
    }
  } catch (error) {
    console.error('Error deleting meal:', error);
    alert('削除に失敗しました');
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
