<template>
  <div class="login-page" :class="{ 'login-page--modal': isModal }">
    <div class="login-card" :class="{ 'login-card--modal': isModal }">
      <div class="login-header">
        <span class="login-badge">多书知识站</span>
        <h1>{{ isRegister ? '创建账号' : '欢迎回来' }}</h1>
        <p class="login-sub">{{ isRegister ? '注册后即可访问全部内容' : '请输入邮箱和密码登录' }}</p>
      </div>

      <form class="login-form" @submit.prevent="onSubmit">
        <label class="field">
          <span>邮箱</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="your@email.com"
            :disabled="busy"
          />
        </label>

        <label class="field">
          <span>密码</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="至少 6 位"
            :disabled="busy"
          />
        </label>

        <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="login-success">{{ successMsg }}</p>

        <button type="submit" class="login-btn" :disabled="busy || !email || !password">
          <span v-if="busy" class="spinner"></span>
          {{ busy ? '处理中...' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>

      <p class="login-toggle">
        {{ isRegister ? '已有账号？' : '还没有账号？' }}
        <button type="button" class="toggle-btn" @click="toggleMode" :disabled="busy">
          {{ isRegister ? '去登录' : '去注册' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../lib/auth.js'

const props = defineProps({
  isModal: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const { signIn, signUp, isAuthenticated } = useAuth()

watch(isAuthenticated, (val) => {
  if (val && props.isModal) {
    emit('close')
  }
})

const isRegister = ref(false)
const email = ref('')
const password = ref('')
const busy = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  busy.value = true

  try {
    if (isRegister.value) {
      await signUp(email.value, password.value)
      successMsg.value = '注册成功！如需邮箱验证，请检查收件箱。'
      isRegister.value = false
    } else {
      await signIn(email.value, password.value)
    }
  } catch (err) {
    const msg = err?.message || '操作失败，请重试'
    if (msg.includes('Invalid login credentials')) {
      errorMsg.value = '邮箱或密码错误'
    } else if (msg.includes('already registered')) {
      errorMsg.value = '该邮箱已被注册'
    } else {
      errorMsg.value = msg
    }
  } finally {
    busy.value = false
  }
}

function toggleMode() {
  isRegister.value = !isRegister.value
  errorMsg.value = ''
  successMsg.value = ''
}
</script>

<style scoped>
.login-page {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #f7f5f0 0%, #edf1f1 55%, #e6ecec 100%);
}

.login-card {
  width: 380px;
  max-width: calc(100vw - 48px);
  padding: 40px 36px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(17, 27, 34, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-badge {
  display: inline-block;
  font-size: 11px;
  color: var(--brand);
  background: var(--brand-soft);
  padding: 3px 12px;
  border-radius: 999px;
  margin-bottom: 12px;
  letter-spacing: 0.08em;
}

.login-header h1 {
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--text-primary);
  font-weight: 700;
}

.login-sub {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 6px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.field input {
  padding: 10px 14px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.18s;
}

.field input:focus {
  border-color: rgba(32, 79, 103, 0.4);
  box-shadow: 0 0 0 3px rgba(32, 79, 103, 0.06);
}

.login-error {
  font-size: 12px;
  color: #dc2626;
}

.login-success {
  font-size: 12px;
  color: #16a34a;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: var(--brand);
  color: var(--text-on-dark);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.18s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.login-toggle {
  text-align: center;
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 20px;
}

.toggle-btn {
  border: none;
  background: transparent;
  color: var(--brand);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.toggle-btn:hover {
  text-decoration: underline;
}

.login-page--modal {
  height: auto;
  background: none;
}

.login-card--modal {
  box-shadow: none;
  border: none;
  padding: 32px 36px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
