// running.js - ランニング機能

let map;
let currentPositionMarker;
let destinationMarker;
let routePath;
let watchId;
let startTime;
let runningInterval;
let isPaused = false;
let totalDistance = 0;
let currentPosition = null;
let previousPosition = null;
let landmarks = [];

// ランニングデータ
const runningData = {
  distance: 0,
  duration: 0,
  calories: 0,
  route: []
};

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // AIの設定を読み込み
  await loadAISettings();

  // ランドマークを読み込み
  await loadLandmarks();

  // ボタンイベント
  document.getElementById('startBtn').addEventListener('click', startRunning);
  document.getElementById('pauseBtn').addEventListener('click', pauseRunning);
  document.getElementById('resumeBtn').addEventListener('click', resumeRunning);
  document.getElementById('endRunBtn').addEventListener('click', endRunning);

  // ランドマーク選択イベント
  document.getElementById('landmarkSelect').addEventListener('change', function() {
    const selectedId = this.value;
    if (selectedId) {
      const landmark = landmarks.find(l => l.id == selectedId);
      if (landmark) {
        setDestination(landmark);
      }
    }
  });
});

// Google Maps初期化
function initMap() {
  // デフォルト位置（東京駅）
  const defaultPosition = { lat: 35.6812, lng: 139.7671 };

  map = new google.maps.Map(document.getElementById('runningMap'), {
    center: defaultPosition,
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false
  });

  // 現在地マーカー
  currentPositionMarker = new google.maps.Marker({
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#4A90E2',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3
    }
  });

  // ルート描画用
  routePath = new google.maps.Polyline({
    map: map,
    strokeColor: '#4A90E2',
    strokeOpacity: 0.8,
    strokeWeight: 4
  });

  // 現在地を取得
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        currentPosition = pos;
        map.setCenter(pos);
        currentPositionMarker.setPosition(pos);
      },
      error => {
        console.error('Geolocation error:', error);
        alert('現在地の取得に失敗しました。位置情報を有効にしてください。');
      }
    );
  }
}

async function loadAISettings() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/user/ai-setting', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      updateAIDisplay(data.personality);
    }
  } catch (error) {
    console.error('Error loading AI settings:', error);
  }
}

function updateAIDisplay(personality) {
  const avatarEmojis = {
    gentle: '😊',
    normal: '🙂',
    strict: '😤',
    unique: '🤪'
  };

  const names = {
    gentle: '優しいトレーナー',
    normal: 'バランス型トレーナー',
    strict: '厳しいトレーナー',
    unique: 'ユニークトレーナー'
  };

  document.getElementById('runningAvatar').textContent = avatarEmojis[personality] || '🏃';
  document.getElementById('runningAiName').textContent = names[personality] || 'トレーナーAI';
}

async function loadLandmarks() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/landmarks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    landmarks = await response.json();
    const select = document.getElementById('landmarkSelect');

    landmarks.forEach(landmark => {
      const option = document.createElement('option');
      option.value = landmark.id;
      option.textContent = `${landmark.name} (${landmark.distance}km)`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading landmarks:', error);
  }
}

function setDestination(landmark) {
  // 目的地マーカーを設置
  if (destinationMarker) {
    destinationMarker.setMap(null);
  }

  destinationMarker = new google.maps.Marker({
    map: map,
    position: { lat: landmark.latitude, lng: landmark.longitude },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: '#FF6B6B',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3
    },
    title: landmark.name
  });

  document.getElementById('destinationName').textContent = landmark.name;
  document.getElementById('remainingDistance').textContent = landmark.distance;
}

function startRunning() {
  if (!document.getElementById('landmarkSelect').value) {
    alert('目的地を選択してください');
    return;
  }

  // ボタン表示を切り替え
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('pauseBtn').style.display = 'block';
  document.getElementById('landmarkSelect').disabled = true;

  // 位置情報の追跡を開始
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      updatePosition,
      handleGeolocationError,
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  }

  // タイマー開始
  startTime = Date.now();
  runningInterval = setInterval(updateStats, 1000);

  // AIからの励ましメッセージ
  updateAIMessage('スタート!頑張ってください!');
}

function pauseRunning() {
  isPaused = true;
  clearInterval(runningInterval);

  document.getElementById('pauseBtn').style.display = 'none';
  document.getElementById('resumeBtn').style.display = 'block';

  updateAIMessage('一時停止中です。準備ができたら再開しましょう。');
}

function resumeRunning() {
  isPaused = false;
  runningInterval = setInterval(updateStats, 1000);

  document.getElementById('resumeBtn').style.display = 'none';
  document.getElementById('pauseBtn').style.display = 'block';

  updateAIMessage('再開!引き続き頑張りましょう!');
}

function updatePosition(position) {
  if (isPaused) return;

  previousPosition = currentPosition;
  currentPosition = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };

  // マーカーとマップを更新
  currentPositionMarker.setPosition(currentPosition);
  map.panTo(currentPosition);

  // ルートに追加
  const path = routePath.getPath();
  path.push(new google.maps.LatLng(currentPosition.lat, currentPosition.lng));
  runningData.route.push(currentPosition);

  // 距離を計算
  if (previousPosition) {
    const distance = calculateDistance(previousPosition, currentPosition);
    totalDistance += distance;
    runningData.distance = totalDistance;
  }

  // 目的地までの残り距離を更新
  if (destinationMarker) {
    const remaining = calculateDistance(currentPosition, destinationMarker.getPosition());
    document.getElementById('remainingDistance').textContent = remaining.toFixed(2);
  }

  // 距離に応じてAIからのメッセージ
  if (totalDistance >= 1 && totalDistance < 1.1) {
    updateAIMessage('1km達成!調子良いですね!');
  } else if (totalDistance >= 3 && totalDistance < 3.1) {
    updateAIMessage('3km突破!素晴らしいペースです!');
  } else if (totalDistance >= 5 && totalDistance < 5.1) {
    updateAIMessage('5km達成!もう半分です、頑張って!');
  }
}

function updateStats() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  runningData.duration = elapsed;

  // 時間表示を更新
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  document.getElementById('runningTime').textContent = 
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // 距離表示を更新
  document.getElementById('currentDistance').textContent = totalDistance.toFixed(2);

  // 平均ペースを計算（分/km）
  if (totalDistance > 0) {
    const paceMinutes = (elapsed / 60) / totalDistance;
    const paceMin = Math.floor(paceMinutes);
    const paceSec = Math.floor((paceMinutes - paceMin) * 60);
    document.getElementById('averagePace').textContent = 
      `${paceMin}:${String(paceSec).padStart(2, '0')}`;
  }

  // カロリーを計算（体重60kg想定、実際はユーザーの体重を使用）
  const calories = totalDistance * 60; // 簡易計算
  runningData.calories = calories;
  document.getElementById('caloriesBurned').textContent = Math.round(calories);
}

async function endRunning() {
  if (!confirm('ランニングを終了しますか?')) {
    return;
  }

  // 追跡を停止
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
  clearInterval(runningInterval);

  // データを保存
  await saveRunningRecord();

  // 結果画面へ
  window.location.href = `running-result.html?distance=${totalDistance.toFixed(2)}&duration=${runningData.duration}&calories=${Math.round(runningData.calories)}`;
}

async function saveRunningRecord() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/running/record', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(runningData)
    });

    if (!response.ok) {
      throw new Error('Failed to save running record');
    }
  } catch (error) {
    console.error('Error saving running record:', error);
  }
}

function updateAIMessage(message) {
  document.getElementById('runningMessage').textContent = message;
}

function calculateDistance(pos1, pos2) {
  // Haversine公式で距離を計算（km単位）
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLng = toRad(pos2.lng - pos1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function handleGeolocationError(error) {
  console.error('Geolocation error:', error);
  alert('位置情報の取得に失敗しました。');
}
