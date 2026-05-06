<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h2>用户管理</h2>
      <span class="user-count">共 {{ users.length }} 人</span>
    </div>

    <div v-if="loading" class="app-state">
      <div class="loading-spinner"></div>
      <div class="state-title">加载中...</div>
    </div>

    <div v-else-if="errorMsg" class="app-state">
      <div class="state-icon">!</div>
      <div class="state-title">加载失败</div>
      <div class="state-desc">{{ errorMsg }}</div>
      <button class="back-btn-lg" @click="fetchUsers">重试</button>
    </div>

    <div v-else class="users-table">
      <div class="user-row header">
        <span class="col-email">邮箱</span>
        <span class="col-name">显示名</span>
        <span class="col-role">角色</span>
        <span class="col-date">注册时间</span>
        <span class="col-actions">操作</span>
      </div>
      <div v-for="u in users" :key="u.id" class="user-row">
        <span class="col-email">{{ u.email || '-' }}</span>
        <span class="col-name">{{ u.display_name || '-' }}</span>
        <span class="col-role">
          <select
            :value="u.role"
            @change="onChangeRole(u.id, $event.target.value)"
            :disabled="u.id === currentUserId"
          >
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </span>
        <span class="col-date">{{ formatDate(u.created_at) }}</span>
        <span class="col-actions">
          <button
            class="danger-btn"
            @click="onDeleteUser(u.id)"
            :disabled="u.id === currentUserId"
          >
            删除
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../lib/auth.js'
import { apiCall } from '../lib/api.js'

const { user } = useAuth()
const users = ref([])
const loading = ref(true)
const errorMsg = ref('')

const currentUserId = computed(() => user.value?.id)

async function fetchUsers() {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await apiCall('/.netlify/functions/admin-users')
    users.value = data.users || []
  } catch (err) {
    errorMsg.value = err.message || '无法加载用户列表'
  } finally {
    loading.value = false
  }
}

async function onChangeRole(userId, newRole) {
  try {
    await apiCall('/.netlify/functions/admin-users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, role: newRole }),
    })
    await fetchUsers()
  } catch (err) {
    alert('修改失败：' + (err.message || '未知错误'))
  }
}

async function onDeleteUser(userId) {
  if (!confirm('确定要删除这个用户吗？')) return
  try {
    await apiCall('/.netlify/functions/admin-users', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    })
    await fetchUsers()
  } catch (err) {
    alert('删除失败：' + (err.message || '未知错误'))
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-panel {
  height: 100%;
  overflow-y: auto;
  padding: 32px 40px;
}

.admin-header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 24px;
}

.admin-header h2 {
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--text-primary);
}

.user-count {
  font-size: 13px;
  color: var(--text-muted);
}

.users-table {
  border: 1px solid var(--border-default);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-elevated);
}

.user-row {
  display: grid;
  grid-template-columns: 2fr 1fr 100px 120px 80px;
  align-items: center;
  padding: 12px 18px;
  font-size: 13px;
  color: var(--text-primary);
}

.user-row:not(:last-child) {
  border-bottom: 1px solid var(--border-subtle);
}

.user-row.header {
  background: var(--bg-sidebar);
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.col-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-role select {
  padding: 4px 8px;
  border: 1px solid var(--border-default);
  border-radius: 6px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
}

.col-role select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.col-date {
  font-size: 12px;
  color: var(--text-tertiary);
}

.danger-btn {
  padding: 4px 12px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: transparent;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.18s;
}

.danger-btn:hover:not(:disabled) {
  background: #fef2f2;
}

.danger-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.app-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary);
}

.state-icon {
  font-size: 40px;
}

.state-title {
  font-size: 18px;
  color: var(--text-primary);
}

.state-desc {
  max-width: 460px;
  line-height: 1.8;
}

.back-btn-lg {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  padding: 8px 16px;
  cursor: pointer;
}

.back-btn-lg:hover {
  color: var(--brand);
  border-color: rgba(32, 79, 103, 0.24);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-default);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
