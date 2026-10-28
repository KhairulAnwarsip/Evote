<template>
  <div class="container py-4">
    <!-- Student Header & Ballot Notice -->
    <div class="bilik-suara-header">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <div class="d-inline-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1 rounded-pill mb-2">
            <i class="bi bi-person-badge-fill text-warning"></i>
            <span class="small fw-semibold">Surat Suara Digital Resmi</span>
          </div>
          <h2 class="fw-bold mb-1">Bilik Suara Pemilihan OSIS</h2>
          <p class="text-white-50 mb-3">
            Tentukan pemimpin OSIS masa depan sekolah kita. Teliti visi, misi, dan program kerja sebelum menentukan pilihan Anda.
          </p>

          <!-- Voter Information Pill -->
          <div v-if="student" class="d-flex flex-wrap gap-3 align-items-center bg-white text-dark p-2 px-3 rounded-3 shadow-sm">
            <div>
              <small class="text-muted d-block lh-1">Nama Pemilih</small>
              <strong class="fs-6">{{ student.full_name }}</strong>
            </div>
            <div class="border-start ps-3">
              <small class="text-muted d-block lh-1">Kelas</small>
              <strong class="fs-6">{{ student.class_name }}</strong>
            </div>
            <div class="border-start ps-3">
              <small class="text-muted d-block lh-1">NISN</small>
              <strong class="fs-6 font-monospace">{{ student.nisn }}</strong>
            </div>
          </div>
        </div>

        <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
          <div class="p-3 bg-white bg-opacity-10 rounded-4 border border-white border-opacity-25 text-start">
            <h6 class="fw-bold text-warning mb-2"><i class="bi bi-info-circle-fill me-1"></i> Petunjuk Mencoblos:</h6>
            <ol class="small mb-0 ps-3 text-white-75">
              <li>Pilih tombol <strong>"Coblos Paslon Ini"</strong> pada kandidat pilihan Anda.</li>
              <li>Periksa kembali konfirmasi di layar dialog.</li>
              <li>Klik <strong>"Ya, Coblos Sekarang"</strong> untuk merekam suara sah.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Candidate List -->
    <div class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold mb-0 text-dark">
          <i class="bi bi-people-fill text-primary me-2"></i>Daftar Pasangan Calon (Paslon)
        </h4>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
          {{ candidates.length }} Paslon Terdaftar
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Memuat data pasangan calon...</p>
      </div>

      <!-- Candidates Grid -->
      <div v-else class="row g-4">
        <div 
          v-for="cand in candidates" 
          :key="cand.id" 
          class="col-md-6 col-lg-4"
        >
          <div class="card card-eosis candidate-card h-100 shadow-sm border">
            <!-- Candidate Number Badge -->
            <div class="candidate-badge-num">
              #0{{ cand.paslon_number }}
            </div>

            <!-- Candidate Image Container -->
            <div class="candidate-img-container">
              <img 
                :src="cand.photo_url || defaultPhoto" 
                :alt="'Paslon No ' + cand.paslon_number" 
                @error="onImageError"
              />
            </div>

            <!-- Candidate Details -->
            <div class="card-body d-flex flex-column p-4">
              <div class="mb-3">
                <span class="badge bg-primary bg-opacity-10 text-primary mb-2 px-2 py-1">
                  Kandidat No. 0{{ cand.paslon_number }}
                </span>
                <h5 class="fw-bold text-dark mb-1">
                  {{ cand.leader_name }}
                </h5>
                <p class="text-muted small mb-0">
                  <i class="bi bi-person-fill text-primary"></i> Calon Ketua ({{ cand.class_leader || '-' }})
                </p>
                <div class="d-flex align-items-center mt-2 pt-2 border-top">
                  <div>
                    <h6 class="fw-semibold text-secondary mb-0">
                      {{ cand.co_leader_name }}
                    </h6>
                    <small class="text-muted">
                      <i class="bi bi-person-badge text-secondary"></i> Calon Wakil Ketua ({{ cand.class_co_leader || '-' }})
                    </small>
                  </div>
                </div>
              </div>

              <!-- Visi Preview -->
              <div class="bg-light p-3 rounded-3 mb-3 border flex-grow-1">
                <h6 class="fw-bold text-dark fs-8 text-uppercase mb-1">
                  <i class="bi bi-compass text-primary me-1"></i> Visi:
                </h6>
                <p class="small text-muted mb-0 fst-italic">
                  "{{ cand.vision || 'Membangun sekolah yang berkarakter dan berdaya saing.' }}"
                </p>
              </div>

              <!-- Buttons: View Details & Vote -->
              <div class="d-grid gap-2">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm rounded-3 py-2 fw-semibold"
                  @click="openDetailModal(cand)"
                >
                  <i class="bi bi-card-text me-1"></i> Baca Visi, Misi & Proker
                </button>
                <button 
                  type="button" 
                  class="btn btn-success btn-rounded py-3 fw-bold fs-6 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  @click="confirmVote(cand)"
                >
                  <i class="bi bi-check2-circle fs-5"></i>
                  <span>COBLOS PASLON #0{{ cand.paslon_number }}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detail Visi & Misi (Reactive Vue Modal) -->
    <div 
      v-if="showDetailModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1055;"
      @click.self="closeDetailModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div v-if="selectedCandidate" class="modal-header bg-primary text-white p-4">
            <div class="d-flex align-items-center gap-3">
              <span class="badge bg-warning text-dark fs-5 fw-bold px-3 py-2 rounded-3">
                #0{{ selectedCandidate.paslon_number }}
              </span>
              <div>
                <h5 class="modal-title fw-bold mb-0">{{ selectedCandidate.leader_name }} & {{ selectedCandidate.co_leader_name }}</h5>
                <small class="text-white-50">Kandidat Ketua & Wakil Ketua OSIS</small>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeDetailModal"></button>
          </div>

          <div v-if="selectedCandidate" class="modal-body p-4" style="max-height: 70vh; overflow-y: auto;">
            <div class="row g-4">
              <div class="col-md-5 text-center">
                <img 
                  :src="selectedCandidate.photo_url || defaultPhoto" 
                  class="img-fluid rounded-4 shadow-sm mb-3" 
                  alt="Foto Paslon"
                  style="max-height: 280px; width: 100%; object-fit: cover;"
                />
                <div class="p-3 bg-light rounded-3 text-start border">
                  <div class="small fw-bold text-muted mb-1">DATA PASLON:</div>
                  <div class="small mb-1"><strong>Ketua:</strong> {{ selectedCandidate.leader_name }} ({{ selectedCandidate.class_leader }})</div>
                  <div class="small"><strong>Wakil:</strong> {{ selectedCandidate.co_leader_name }} ({{ selectedCandidate.class_co_leader }})</div>
                </div>
              </div>

              <div class="col-md-7">
                <div class="mb-3">
                  <h6 class="fw-bold text-primary mb-1"><i class="bi bi-eye me-1"></i> VISI:</h6>
                  <p class="p-3 bg-light rounded-3 border mb-0 small">{{ selectedCandidate.vision }}</p>
                </div>

                <div class="mb-3">
                  <h6 class="fw-bold text-primary mb-1"><i class="bi bi-list-check me-1"></i> MISI:</h6>
                  <div class="p-3 bg-light rounded-3 border small" style="white-space: pre-line;">{{ selectedCandidate.mission }}</div>
                </div>

                <div v-if="selectedCandidate.programs">
                  <h6 class="fw-bold text-primary mb-1"><i class="bi bi-trophy me-1"></i> PROGRAM UNGGULAN:</h6>
                  <p class="p-3 bg-light rounded-3 border mb-0 small">{{ selectedCandidate.programs }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedCandidate" class="modal-footer p-3 bg-light">
            <button type="button" class="btn btn-secondary rounded-3 px-3" @click="closeDetailModal">Tutup</button>
            <button 
              type="button" 
              class="btn btn-success fw-bold rounded-3 px-4 shadow-sm"
              @click="confirmVoteFromModal(selectedCandidate)"
            >
              <i class="bi bi-check-circle me-1"></i> Coblos Paslon Ini
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Coblos (Reactive Vue Modal) -->
    <div 
      v-if="showConfirmModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;"
      @click.self="closeConfirmModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg text-center p-3">
          <div class="modal-body p-4" v-if="candidateToVote">
            <div class="mb-3">
              <span class="badge bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <i class="bi bi-check2-circle display-4"></i>
              </span>
            </div>

            <h4 class="fw-bold mb-2 text-dark">Konfirmasi Pilihan Anda</h4>
            <p class="text-muted small mb-4">
              Apakah Anda yakin ingin memberikan suara Anda kepada pasangan calon:
            </p>

            <div class="p-3 bg-light rounded-4 border mb-4">
              <span class="badge bg-primary fs-6 px-3 py-1 rounded-pill mb-2">
                PASLON #0{{ candidateToVote.paslon_number }}
              </span>
              <h5 class="fw-bold text-dark mb-1">{{ candidateToVote.leader_name }}</h5>
              <div class="text-secondary small">&amp; {{ candidateToVote.co_leader_name }}</div>
            </div>

            <div class="alert alert-warning text-start small mb-4 d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill fs-5 text-warning flex-shrink-0"></i>
              <div><strong>Perhatian:</strong> Suara yang telah dikonfirmasi bersifat final dan tidak dapat diubah lagi.</div>
            </div>

            <div class="d-flex gap-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary w-50 py-2 rounded-3 fw-semibold"
                @click="closeConfirmModal"
                :disabled="isSubmitting"
              >
                Batal / Cek Lagi
              </button>
              <button 
                type="button" 
                class="btn btn-success w-50 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                @click="executeVote"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-fingerprint"></i>
                <span>{{ isSubmitting ? 'Mencatat Suara...' : 'Ya, Coblos Sekarang' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { dbService } from '../supabase.js';
import confetti from 'canvas-confetti';

export default {
  name: 'BilikSuara',
  data() {
    return {
      student: null,
      candidates: [],
      isLoading: true,
      isSubmitting: false,
      showDetailModal: false,
      showConfirmModal: false,
      selectedCandidate: null,
      candidateToVote: null,
      defaultPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    };
  },
  async created() {
    const raw = sessionStorage.getItem('eosis_student_session');
    if (!raw) {
      this.$router.push('/');
      return;
    }
    this.student = JSON.parse(raw);

    if (this.student.has_voted) {
      this.$router.push('/voting-sukses');
      return;
    }

    await this.loadCandidates();
  },
  methods: {
    async loadCandidates() {
      this.isLoading = true;
      try {
        this.candidates = await dbService.getCandidates();
      } catch (err) {
        console.error('Gagal memuat kandidat:', err);
      } finally {
        this.isLoading = false;
      }
    },
    openDetailModal(cand) {
      this.selectedCandidate = cand;
      this.showDetailModal = true;
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedCandidate = null;
    },
    confirmVoteFromModal(cand) {
      this.closeDetailModal();
      this.confirmVote(cand);
    },
    confirmVote(cand) {
      this.candidateToVote = cand;
      this.showConfirmModal = true;
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.candidateToVote = null;
    },
    async executeVote() {
      if (!this.candidateToVote || !this.student) return;

      this.isSubmitting = true;
      try {
        await dbService.recordVote({
          studentId: this.student.id,
          candidateId: this.candidateToVote.id,
          studentClass: this.student.class_name
        });

        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }

        // Update local session
        this.student.has_voted = true;
        this.student.voted_at = new Date().toISOString();
        this.student.chosen_paslon = this.candidateToVote.paslon_number;
        sessionStorage.setItem('eosis_student_session', JSON.stringify(this.student));

        this.closeConfirmModal();
        this.$router.push('/voting-sukses');

      } catch (err) {
        alert('Gagal merekam suara: ' + (err.message || 'Terjadi kesalahan sistem'));
      } finally {
        this.isSubmitting = false;
      }
    },
    onImageError(e) {
      e.target.src = this.defaultPhoto;
    }
  }
};
</script>
