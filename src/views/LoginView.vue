<template>
  <div class="auth-page">
    <section class="auth-copy">
      <h1>캠퍼스 공간 예약 시스템</h1>
      <p>교내 건물의 소형 회의실과 개인 좌석을 간편하게 예약하세요. 예약 가능 시간은 오전 9시 ~ 오후 9시이며, 1회 최대 2시간까지 이용 가능합니다.</p>
    </section>

    <section class="auth-panel">
      <n-card class="auth-card" :bordered="false">
        <n-tabs v-model:value="mode" size="large" animated>
          <n-tab-pane name="login" tab="로그인">
            <n-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
              <n-form-item path="username" label="아이디">
                <n-input v-model:value="loginForm.username" placeholder="사용자 아이디" />
              </n-form-item>
              <n-form-item path="password" label="비밀번호">
                <n-input
                  v-model:value="loginForm.password"
                  placeholder="비밀번호를 입력하세요"
                  type="password"
                  show-password-on="click"
                  @keyup.enter="submitLogin"
                />
              </n-form-item>
              <n-button type="primary" block size="large" :loading="loading" @click="submitLogin">
                로그인
              </n-button>
            </n-form>
          </n-tab-pane>

          <n-tab-pane name="signup" tab="회원가입">
            <n-form ref="signupFormRef" :model="signupForm" :rules="signupRules" size="large">
              <n-form-item path="username" label="아이디">
                <n-input v-model:value="signupForm.username" placeholder="4자 이상" />
              </n-form-item>
              <n-form-item path="name" label="이름">
                <n-input v-model:value="signupForm.name" placeholder="이름을 입력하세요" />
              </n-form-item>
              <n-form-item path="email" label="이메일">
                <n-input v-model:value="signupForm.email" placeholder="name@example.com" />
              </n-form-item>
              <n-form-item path="affiliation" label="소속">
                <n-input v-model:value="signupForm.affiliation" placeholder="예: 컴퓨터학부 (선택)" />
              </n-form-item>
              <n-form-item path="password" label="비밀번호">
                <n-input
                  v-model:value="signupForm.password"
                  placeholder="최소 4자"
                  type="password"
                  show-password-on="click"
                />
              </n-form-item>
              <n-button type="primary" block size="large" :loading="loading" @click="submitSignup">
                계정 생성
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
  username: '',
  password: ''
});

const signupForm = reactive({
  username: '',
  password: '',
  name: '',
  email: '',
  affiliation: ''
});

const loginRules: FormRules = {
  username: [{ required: true, message: '아이디를 입력하세요', trigger: ['input', 'blur'] }],
  password: [{ required: true, message: '비밀번호를 입력하세요', trigger: ['input', 'blur'] }]
};

const signupRules: FormRules = {
  username: [
    { required: true, message: '아이디를 입력하세요', trigger: ['input', 'blur'] },
    { min: 4, message: '아이디는 최소 4자 이상이어야 합니다', trigger: ['input', 'blur'] }
  ],
  password: [
    { required: true, message: '비밀번호를 입력하세요', trigger: ['input', 'blur'] },
    { min: 4, message: '비밀번호는 최소 4자 이상이어야 합니다', trigger: ['input', 'blur'] }
  ],
  name: [{ required: true, message: '이름을 입력하세요', trigger: ['input', 'blur'] }],
  email: [
    { type: 'email', message: '이메일 형식이 올바르지 않습니다', trigger: ['input', 'blur'] }
  ]
};

async function submitLogin() {
  await loginFormRef.value?.validate();
  loading.value = true;
  try {
    await auth.login(loginForm);
    message.success('로그인 성공');
    await router.push({ name: 'buildings' });
  } catch (error) {
    message.error(errorMessage(error, '로그인 실패'));
  } finally {
    loading.value = false;
  }
}

async function submitSignup() {
  await signupFormRef.value?.validate();
  loading.value = true;
  try {
    await auth.signUp(signupForm);
    message.success('회원가입 성공, 로그인하세요');
    mode.value = 'login';
    loginForm.username = signupForm.username;
    loginForm.password = signupForm.password;
  } catch (error) {
    message.error(errorMessage(error, '회원가입 실패'));
  } finally {
    loading.value = false;
  }
}
</script>