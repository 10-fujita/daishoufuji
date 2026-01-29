// admin-login.js - 管理者ログイン機能

document.addEventListener('DOMContentLoaded', function() {
  const adminLoginForm = document.getElementById('adminLoginForm');

  adminLoginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // エラーメッセージをクリア
    document.getElementById('adminIdError').textContent = '';
    document.getElementById('passwordError').textContent = '';

    const formData = {
      adminId: document.getElementById('adminId').value,
      password: document.getElementById('password').value,
      remember: document.getElementById('remember').checked
    };

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminId', data.adminId);
        localStorage.setItem('adminRole', data.role);
        
        // 管理者ダッシュボードへリダイレクト
        window.location.href = 'admin-dashboard.html';
      } else {
        // エラーメッセージを表示
        if (data.field === 'adminId') {
          document.getElementById('adminIdError').textContent = data.message;
        } else if (data.field === 'password') {
          document.getElementById('passwordError').textContent = data.message;
        } else {
          alert(data.message || 'ログインに失敗しました');
        }
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('ログイン中にエラーが発生しました。もう一度お試しください。');
    }
  });
});
