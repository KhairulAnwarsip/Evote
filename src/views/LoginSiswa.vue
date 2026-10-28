<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-5">
        
        <!-- Welcome Card -->
        <div class="card card-eosis border-0 shadow-lg overflow-hidden">
          <div class="bg-primary text-white p-4 text-center" style="background: linear-gradient(135deg, #1e3a8a, #2563eb) !important;">
            <div class="badge bg-white text-primary rounded-pill px-3 py-1 mb-2 fw-bold text-uppercase">
              <i class="bi bi-shield-check me-1"></i> Bilik Suara Elektronik
            </div>
            <h4 class="fw-bold mb-1">Masuk Pemilih Siswa</h4>
            <p class="mb-0 text-white-50 small">Masukkan NISN dan Tanggal Lahir Anda sesuai Data Pokok Pendidikan (DAPODIK)</p>
          </div>

          <div class="card-body p-4 p-md-4">
            <!-- Election Closed Warning -->
            <div v-if="settings.election_status === 'closed'" class="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              <i class="bi bi-exclamation-triangle-fill fs-4"></i>
              <div>
                <strong>Pemilihan Sedang Ditutup!</strong>
                <div class="small">Sesi pemungutan suara telah selesai atau belum dimulai oleh panitia.</div>
              </div>
            </div>

            <!-- Error Notification -->
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-x-circle-fill fs-5"></i>
              <div class="small">{{ errorMessage }}</div>
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleStudentLogin">
              <!-- NISN Input -->
              <div class="mb-3">
                <label for="nisnInput" class="form-label fw-semibold text-dark">
                  <i class="bi bi-person-vcard text-primary me-1"></i> NISN (Nomor Induk Siswa Nasional)
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-upc-scan text-muted"></i></span>
                  <input 
                    type="text" 
                    id="nisnInput" 
                    v-model.trim="nisn" 
                    class="form-control form-control-lg" 
                    placeholder="Contoh: 0078901234" 
                    required 
                    autocomplete="off"
                  />
                </div>
                <div class="form-text">NISN 10 digit tercatat di kartu pelajar.</div>
              </div>

              <!-- Tanggal Lahir Input (YYYY-MM-DD) -->
              <div class="mb-4">
                <label for="birthDateInput" class="form-label fw-semibold text-dark">
                  <i class="bi bi-calendar-event text-primary me-1"></i> Tanggal Lahir
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-calendar3 text-muted"></i></span>
                  <input 
                    type="date" 
                    id="birthDateInput" 
                    v-model="birthDate" 
                    class="form-control form-control-lg" 
                    required 
                  />
                </div>
                <div class="form-text">Format: Tahun-Bulan-Tanggal (YYYY-MM-DD).</div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn btn-primary btn-lg w-100 fw-bold btn-rounded shadow-sm d-flex align-items-center justify-content-center gap-2"
                :disabled="isLoading || settings.election_status === 'closed'"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
                <span>{{ isLoading ? 'Memverifikasi Data...' : 'Masuk ke Bilik Suara' }}</span>
              </button>
            </form>

            <hr class="my-4 text-muted" />

            <!-- Demo Helper Autofill Card -->
            <div class="bg-light p-3 rounded-3 border">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge bg-secondary text-uppercase"><i class="bi bi-lightbulb"></i> Akun Uji Coba Demo</span>
                <small class="text-muted">Klik untuk mengisi otomatis</small>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary"
                  @click="fillDemo('0078901234', '2008-05-14', 'Ahmad Rizki (Belum Memilih)')"
                >
                  <i class="bi bi-arrow-right-circle"></i> Ahmad (Belum Memilih)
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-secondary"
                  @click="fillDemo('1234567890', '2008-01-01', 'Siswa Demo (Belum Memilih)')"
                >
                  <i class="bi bi-arrow-right-circle"></i> Siswa Demo
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-danger"
                  @click="fillDemo('0078901235', '2008-08-20', 'Siti (Sudah Memilih)')"
                  title="Uji coba penolakan bagi yang sudah memilih"
                >
                  <i class="bi bi-check2-all"></i> Siti (Sudah Memilih)
                </button>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="d-flex justify-content-between align-items-center mt-4 pt-2">
              <router-link to="/hasil-suara" class="text-decoration-none small text-muted d-flex align-items-center gap-1">
                <i class="bi bi-graph-up text-primary"></i> Pantau Perolehan Suara
              </router-link>
              <router-link to="/admin/login" class="text-decoration-none small text-muted d-flex align-items-center gap-1">
                <i class="bi bi-shield-lock"></i> Portal Guru & Panitia
              </router-link>
            </div>

          </div>
        </div>

        <!-- Rules & Integrity Note -->
        <div class="mt-4 text-center text-muted small">
          <p class="mb-1"><i class="bi bi-shield-check text-success"></i> Asas Pemilihan: <strong>LUBER JURDIL</strong> (Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil)</p>
          <p class="mb-0">Setiap siswa hanya berhak memberikan 1 (satu) suara sah dan tidak dapat diubah kembali.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { dbService } from '../supabase.js';

export default {
  name: 'LoginSiswa',
  data() {
    return {
      nisn: '',
      birthDate: '',
      errorMessage: '',
      isLoading: false,
      settings: {}
    };
  },
  async created() {
    this.settings = await dbService.getSettings();
  },
  methods: {
    fillDemo(demoNisn, demoBirth, label) {
      this.nisn = demoNisn;
      this.birthDate = demoBirth;
      this.errorMessage = '';
    },
    async handleStudentLogin() {
      this.errorMessage = '';

      if (!this.nisn || !this.birthDate) {
        this.errorMessage = 'Mohon masukkan NISN dan Tanggal Lahir Anda.';
        return;
      }

      this.isLoading = true;
      try {
        const student = await dbService.authenticateStudent(this.nisn, this.birthDate);

        if (!student) {
          this.errorMessage = 'NISN atau Tanggal Lahir tidak sesuai dengan Daftar Pemilih Tetap (DPT). Silakan periksa kembali atau hubungi panitia pemilihan.';
          this.isLoading = false;
          return;
        }

        // Check if student already voted
        if (student.has_voted) {
          sessionStorage.setItem('eosis_student_session', JSON.stringify(student));
          this.$router.push('/voting-sukses');
          return;
        }

        // Check if election is open
        if (this.settings.election_status === 'closed') {
          this.errorMessage = 'Sesi pemilihan saat ini sedang ditutup oleh panitia.';
          this.isLoading = false;
          return;
        }

        // Save session
        sessionStorage.setItem('eosis_student_session', JSON.stringify(student));
        this.$router.push('/bilik-suara');

      } catch (err) {
        this.errorMessage = 'Terjadi kesalahan sistem saat memverifikasi data. ' + (err.message || '');
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
