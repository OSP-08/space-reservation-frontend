<template>
  <div class="auth-page">
    <section class="auth-copy">
      <h1>空间预约系统</h1>
      <p>集中管理会议室、活动空间和预约时段，让团队知道哪里可用、谁在使用、什么时候可以进入。</p>
    </section>

    <section class="auth-panel">
      <n-card class="auth-card" :bordered="false">
        <n-tabs v-model:value="mode" size="large" animated>
          <n-tab-pane name="login" tab="登录">
            <n-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
              <n-form-item path="email" label="邮箱">
                <n-input v-model:value="loginForm.email" placeholder="name@example.com" />
              </n-form-item>
              <n-form-item path="password" label="密码">
                <n-input
                  v-model:value="loginForm.password"
                  placeholder="请输入密码"
                  type="password"
                  show-password-on="click"
                  @keyup.enter="submitLogin"
                />
              </n-form-item>
              <n-button type="primary" block size="large" :loading="loading" @click="submitLogin">
                登录
              </n-button>
            </n-form>
          </n-tab-pane>

          <n-tab-pane name="signup" tab="注册">
            <n-form ref="signupFormRef" :model="signupForm" :rules="signupRules" size="large">
              <n-form-item path="email" label="邮箱">
                <n-input v-model:value="signupForm.email" placeholder="name@example.com" />
              </n-form-item>
              <n-form-item path="name" label="姓名">
                <n-input v-model:value="signupForm.name" placeholder="请输入姓名" />
              </n-form-item>
              <n-form-item path="organization" label="组织">
                <n-input v-model:value="signupForm.organization" placeholder="可选" />
              </n-form-item>
              <n-form-item path="password" label="密码">
                <n-input
                  v-model:value="signupForm.password"
                  placeholder="至少 8 位"
                  type="password"
                  show-password-on="click"
                />
              </n-form-item>
              <n-button type="primary" block size="large" :loading="loading" @click="submitSignup">
                创建账号
              </n-button>
            </n-form>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, type FormInst, type FormRules } from 'naive-ui';
import { errorMessage } from '@/api/http';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const message = useMessage();
const auth = useAuthStore();
const mode = ref<'login' | 'signup'>('login');
const loading = ref(false);
const loginFormRef = ref<FormInst | null>(null);
const signupFormRef = ref<FormInst | null>(null);

const loginForm = reactive({
  email: '',
  password: ''
});

const signupForm = reactive({
  email: '',
  password: '',
  name: '',
  organization: ''
});

const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: ['input', 'blur'] },
    { type: 'email', message: '邮箱格式不正确', trigger: ['input', 'blur'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: ['input', 'blur'] }]
};

const signupRules: FormRules = {
  ...loginRules,
  password: [
    { required: true, message: '请输入密码', trigger: ['input', 'blur'] },
    { min: 8, message: '密码至少 8 位', trigger: ['input', 'blur'] }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: ['input', 'blur'] }]
};

async function submitLogin() {
  await loginFormRef.value?.validate();
  loading.value = true;
  try {
    await auth.login(loginForm);
    message.success('登录成功');
    await router.push({ name: 'spaces' });
  } catch (error) {
    message.error(errorMessage(error, '登录失败'));
  } finally {
    loading.value = false;
  }
}

async function submitSignup() {
  await signupFormRef.value?.validate();
  loading.value = true;
  try {
    await auth.signUp(signupForm);
    message.success('注册成功，请登录');
    mode.value = 'login';
    loginForm.email = signupForm.email;
    loginForm.password = signupForm.password;
  } catch (error) {
    message.error(errorMessage(error, '注册失败'));
  } finally {
    loading.value = false;
  }
}
</script>
