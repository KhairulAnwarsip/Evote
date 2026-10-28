<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        
        <div class="card card-eosis border-0 shadow-lg text-center p-4 p-md-5">
          <!-- Success Animation Icon -->
          <div class="mb-3">
            <span class="badge bg-success bg-opacity-10 text-success p-3 rounded-circle shadow-sm">
              <i class="bi bi-check-circle-fill display-3"></i>
            </span>
          </div>

          <span class="badge bg-success rounded-pill px-3 py-2 text-uppercase mb-2 align-self-center">
            <i class="bi bi-fingerprint me-1"></i> Suara Sah Tercatat
          </span>

          <h2 class="fw-bold text-dark mb-2">Terima Kasih Atas Partisipasi Anda!</h2>
          <p class="text-muted mb-4">
            Hak suara Anda telah tersimpan dengan aman ke dalam sistem database eOSIS. Pilihan Anda sepenuhnya bersifat rahasia dan sah.
          </p>

          <!-- Digital Receipt Box -->
          <div v-if="student" class="bg-light p-4 rounded-4 text-start border mb-4">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h6 class="fw-bold mb-0 text-primary"><i class="bi bi-receipt me-1"></i> Bukti Pemungutan Suara Digital</h6>
              <span class="badge bg-success">TERVERIFIKASI</span>
            </div>

            <div class="row g-2 small">
              <div class="col-5 text-muted">Nama Siswa:</div>
              <div class="col-7 fw-semibold text-dark">{{ student.full_name }}</div>

              <div class="col-5 text-muted">NISN:</div>
              <div class="col-7 font-monospace fw-semibold">{{ student.nisn }}</div>

              <div class="col-5 text-muted">Kelas:</div>
              <div class="col-7 fw-semibold">{{ student.class_name }}</div>

              <div class="col-5 text-muted">Waktu Memilih:</div>
              <div class="col-7 font-monospace text-muted">{{ formatTime(student.voted_at) }}</div>

              <div class="col-5 text-muted">Status:</div>
              <div class="col-7 text-success fw-bold">1 Suara Sah Terhitung</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-grid gap-2">
            <router-link to="/hasil-suara" class="btn btn-primary btn-rounded py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-bar-chart-fill"></i>
              <span>Pantau Hasil & Perolehan Suara Real-time</span>
            </router-link>

            <button @click="finishVoting" class="btn btn-outline-secondary btn-rounded py-2">
              <i class="bi bi-box-arrow-right me-1"></i> Selesai &amp; Keluar dari Bilik Suara
            </button>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VotingSukses',
  data() {
    return {
      student: null
    };
  },
  created() {
    const raw = sessionStorage.getItem('eosis_student_session');
    if (raw) {
      this.student = JSON.parse(raw);
    }
  },
  methods: {
    formatTime(isoString) {
      if (!isoString) return new Date().toLocaleString('id-ID');
      try {
        return new Date(isoString).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'medium'
        });
      } catch {
        return isoString;
      }
    },
    finishVoting() {
      sessionStorage.removeItem('eosis_student_session');
      this.$router.push('/');
    }
  }
};
</script>
