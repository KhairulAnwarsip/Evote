<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-7 col-lg-4">
        
        <div class="card card-eosis border-0 shadow-lg overflow-hidden">
          <div class="bg-dark text-white p-4 text-center">
            <div class="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase">
              <i class="bi bi-shield-lock-fill me-1"></i> Panel Administrator
            </div>
            <h4 class="fw-bold mb-1">Masuk Panitia OSIS</h4>
            <p class="text-white-50 small mb-0">Kelola DPT, Paslon, dan Rekapitulasi Suara</p>
          </div>

          <div class="card-body p-4">
            
            <div v-if="errorMessage" class="alert alert-danger small d-flex align-items-center gap-2 mb-3" role="alert">
              <i class="bi bi-x-circle-fill fs-5"></i>
              <div>{{ errorMessage }}</div>
            </div>

            <form @submit.prevent="handleAdminLogin">
              <div class="mb-4">
                <label for="adminPin" class="form-label fw-semibold text-dark">
                  <i class="bi bi-key-fill text-warning me-1"></i> PIN / Password Admin
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-lock text-muted"></i></span>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="adminPin" 
                    v-model.trim="inputPin" 
                    class="form-control form-control-lg" 
                    placeholder="Masukkan PIN Admin" 
                    required 
                    autocomplete="current-password"
                  />
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div class="form-text">PIN standar bawaan sistem: <code>123456</code></div>
              </div>

              <button 
                type="submit" 
                class="btn btn-dark btn-lg w-100 fw-bold btn-rounded shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-box-arrow-in-right"></i>
                <span>{{ isLoading ? 'Memeriksa Kredensial...' : 'Masuk Dashboard Admin' }}</span>
              </button>

              <!-- Quick Autofill Demo Button -->
              <button 
                type="button" 
                class="btn btn-sm btn-outline-warning text-dark w-100 fw-semibold"
                @click="fillDefaultPin"
              >
                <i class="bi bi-magic me-1"></i> Gunakan Default PIN (123456)
              </button>
            </form>

            <hr class="my-4 text-muted" />

            <div class="text-center">
              <router-link to="/" class="text-decoration-none small text-muted">
                <i class="bi bi-arrow-left me-1"></i> Kembali ke Login Siswa
              </router-link>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { dbService } from '../../supabase.js';

export default {
  name: 'LoginAdmin',
  data() {
    return {
      inputPin: '',
      showPassword: false,
      errorMessage: '',
      isLoading: false
    };
  },
  methods: {
    fillDefaultPin() {
      this.inputPin = '123456';
      this.errorMessage = '';
    },
    async handleAdminLogin() {
      this.errorMessage = '';
      if (!this.inputPin) {
        this.errorMessage = 'Silakan masukkan PIN atau Password Admin.';
        return;
      }

      this.isLoading = true;
      try {
        const settings = await dbService.getSettings();
        const correctPin = settings.admin_pin || '123456';

        if (this.inputPin === correctPin) {
          sessionStorage.setItem('eosis_admin_session', JSON.stringify({
            role: 'admin',
            logged_at: new Date().toISOString()
          }));
          this.$router.push('/admin/dashboard');
        } else {
          this.errorMessage = 'PIN / Password Admin yang Anda masukkan salah!';
        }
      } catch (err) {
        this.errorMessage = 'Terjadi kesalahan sistem: ' + (err.message || '');
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
