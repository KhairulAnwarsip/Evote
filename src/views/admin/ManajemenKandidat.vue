<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1">
          <i class="bi bi-person-vcard text-primary me-2"></i>Manajemen Pasangan Calon (Kandidat)
        </h3>
        <p class="text-muted small mb-0">Kelola nomor urut, profil pasangan calon, visi, misi, serta unggah foto ke Supabase Storage</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <span 
          class="badge px-3 py-2 rounded-pill fw-semibold"
          :class="isSupabaseActive ? 'bg-success' : 'bg-warning text-dark'"
        >
          <i class="bi" :class="isSupabaseActive ? 'bi-database-check' : 'bi-hdd-fill'"></i>
          {{ isSupabaseActive ? 'Database: Supabase Cloud' : 'Database: Penyimpanan Lokal' }}
        </span>

        <button 
          type="button" 
          class="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-3 py-2 fw-semibold"
          @click="openAddCandidateModal"
        >
          <i class="bi bi-plus-circle-fill"></i>
          <span>Tambah Paslon Baru</span>
        </button>
      </div>
    </div>

    <!-- Toast Notification Banner -->
    <div v-if="toastMessage" class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
      <i class="bi bi-check-circle-fill fs-5 text-success"></i>
      <div class="fw-semibold">{{ toastMessage }}</div>
      <button type="button" class="btn-close" @click="toastMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
      <i class="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
      <div>{{ errorMessage }}</div>
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <!-- Candidate List Grid -->
    <div class="row g-4 mb-4">
      <div 
        v-for="cand in candidates" 
        :key="cand.id" 
        class="col-md-6 col-xl-4"
      >
        <div class="card card-eosis border h-100 shadow-sm overflow-hidden">
          <div class="position-relative">
            <!-- Number badge -->
            <div class="position-absolute top-0 start-0 m-3 badge bg-primary fs-6 px-3 py-2 shadow-sm rounded-3">
              #0{{ cand.paslon_number }}
            </div>

            <!-- Image with fixed aspect ratio -->
            <img 
              :src="cand.photo_url || defaultPhoto" 
              class="w-100" 
              style="height: 220px; object-fit: cover;" 
              alt="Foto Paslon"
              @error="onImageError"
            />
          </div>

          <div class="card-body p-4 d-flex flex-column">
            <h5 class="fw-bold text-dark mb-1">{{ cand.leader_name }}</h5>
            <small class="text-primary fw-semibold mb-2 d-block">
              <i class="bi bi-person-fill"></i> Calon Ketua ({{ cand.class_leader || '-' }})
            </small>

            <div class="border-top pt-2 mb-3">
              <h6 class="fw-semibold text-secondary mb-0">{{ cand.co_leader_name }}</h6>
              <small class="text-muted">
                <i class="bi bi-person-badge"></i> Calon Wakil Ketua ({{ cand.class_co_leader || '-' }})
              </small>
            </div>

            <div class="bg-light p-3 rounded-3 border small mb-3 flex-grow-1">
              <strong class="text-dark d-block mb-1">Visi:</strong>
              <p class="text-muted mb-0 fst-italic">"{{ cand.vision }}"</p>
            </div>

            <!-- Actions: Edit & Hapus Buttons -->
            <div class="d-flex gap-2 pt-2 border-top">
              <button 
                type="button"
                class="btn btn-outline-primary btn-sm flex-grow-1 rounded-3 py-2 fw-semibold" 
                @click="openEditCandidateModal(cand)"
              >
                <i class="bi bi-pencil-square me-1"></i> Edit Data
              </button>
              <button 
                type="button"
                class="btn btn-outline-danger btn-sm rounded-3 px-3" 
                @click="confirmDeleteCandidate(cand)"
                title="Hapus Paslon"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="candidates.length === 0" class="col-12 text-center py-5">
        <i class="bi bi-person-x display-3 text-muted"></i>
        <h5 class="text-muted mt-2">Belum ada Pasangan Calon terdaftar</h5>
        <button class="btn btn-primary mt-2" @click="openAddCandidateModal">Tambah Paslon Pertama</button>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit Paslon (Reactive Vue Modal) -->
    <div 
      v-if="showModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1055;"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <div class="modal-header bg-primary text-white p-4">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-person-badge-fill me-2"></i>{{ isEditing ? 'Edit Pasangan Calon' : 'Tambah Pasangan Calon Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveCandidate">
            <div class="modal-body p-4" style="max-height: 70vh; overflow-y: auto;">
              
              <!-- Modal Error Alert with RLS Quick-Fix -->
              <div v-if="modalErrorMessage" class="alert alert-danger p-3 mb-3 rounded-3 shadow-sm" role="alert">
                <div class="d-flex align-items-start gap-2 mb-2">
                  <i class="bi bi-shield-x fs-4 text-danger flex-shrink-0"></i>
                  <div>
                    <div class="fw-bold">Gagal Menyimpan ke Database Supabase</div>
                    <div class="small">{{ modalErrorMessage }}</div>
                  </div>
                </div>

                <!-- If RLS error, show quick solution -->
                <div v-if="isRlsError" class="p-3 bg-white rounded-3 border mt-2 text-dark">
                  <div class="fw-bold small text-danger mb-1">
                    <i class="bi bi-lightning-charge-fill text-warning me-1"></i> Solusi Cepat Membuka Akses Database (RLS):
                  </div>
                  <p class="small text-muted mb-2">
                    Tabel di database Supabase Anda memiliki fitur Row Level Security yang masih aktif tanpa izin tulis. Salin dan jalankan perintah ini di menu <strong>SQL Editor</strong> dashboard Supabase Anda:
                  </p>
                  <pre class="bg-dark text-warning p-2 rounded small font-monospace mb-2 user-select-all" style="font-size: 0.78rem;">ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;</pre>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-danger fw-semibold"
                    @click="copyQuickSql"
                  >
                    <i class="bi" :class="copiedSql ? 'bi-check2' : 'bi-clipboard'"></i>
                    {{ copiedSql ? 'Perintah SQL Berhasil Disalin!' : 'Salin Perintah SQL Perbaikan' }}
                  </button>
                </div>
              </div>

              <div class="row g-3">
                <!-- Nomor Urut -->
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Nomor Urut Paslon *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="99" 
                    v-model.number="form.paslon_number" 
                    class="form-control" 
                    required 
                    placeholder="Contoh: 1"
                  />
                </div>

                <!-- Warna Tema -->
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Warna Tema Paslon</label>
                  <div class="d-flex gap-2">
                    <input type="color" v-model="form.color_theme" class="form-control form-control-color" />
                    <input type="text" v-model="form.color_theme" class="form-control font-monospace" />
                  </div>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold text-muted">ID Kandidat</label>
                  <input type="text" :value="form.id || '(Dibuat Otomatis)'" class="form-control bg-light" disabled />
                </div>

                <!-- Calon Ketua -->
                <div class="col-md-8">
                  <label class="form-label fw-semibold text-dark">Nama Lengkap Calon Ketua *</label>
                  <input type="text" v-model.trim="form.leader_name" class="form-control" required placeholder="Nama Ketua" />
                </div>

                <!-- Kelas Calon Ketua -->
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Asal Kelas Calon Ketua</label>
                  <select v-model="form.class_leader" class="form-select">
                    <option value="">Pilih Kelas</option>
                    <option v-for="c in classes" :key="c.id" :value="c.name">{{ c.name }}</option>
                  </select>
                </div>

                <!-- Calon Wakil Ketua -->
                <div class="col-md-8">
                  <label class="form-label fw-semibold text-dark">Nama Lengkap Calon Wakil *</label>
                  <input type="text" v-model.trim="form.co_leader_name" class="form-control" required placeholder="Nama Wakil" />
                </div>

                <!-- Kelas Calon Wakil -->
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Asal Kelas Calon Wakil</label>
                  <select v-model="form.class_co_leader" class="form-select">
                    <option value="">Pilih Kelas</option>
                    <option v-for="c in classes" :key="c.id" :value="c.name">{{ c.name }}</option>
                  </select>
                </div>

                <!-- Fitur Upload Gambar ke Supabase Storage -->
                <div class="col-12">
                  <div class="card bg-light border p-3 rounded-3">
                    <label class="form-label fw-bold mb-1 text-primary">
                      <i class="bi bi-cloud-arrow-up-fill me-1"></i> Upload Foto Paslon ke Supabase Storage
                    </label>
                    <div class="form-text mb-2">Unggah berkas foto resmi pasangan calon (JPG, PNG, WebP).</div>

                    <div class="row align-items-center g-3">
                      <div class="col-sm-4 text-center">
                        <img 
                          :src="form.photo_url || defaultPhoto" 
                          alt="Preview Foto" 
                          class="img-thumbnail rounded-3 shadow-sm bg-white"
                          style="height: 130px; width: 100%; object-fit: cover;"
                          @error="onImageError"
                        />
                        <div class="small text-muted mt-1">Pratinjau Foto</div>
                      </div>

                      <div class="col-sm-8">
                        <input 
                          type="file" 
                          class="form-control mb-2" 
                          accept="image/*" 
                          @change="handleFileUpload"
                          :disabled="isUploading"
                        />
                        
                        <!-- Progress or Upload Status -->
                        <div v-if="isUploading" class="d-flex align-items-center gap-2 text-primary small my-1">
                          <span class="spinner-border spinner-border-sm" role="status"></span>
                          <span>Mengunggah foto ke storage...</span>
                        </div>
                        <div v-if="uploadSuccessMsg" class="text-success small my-1">
                          <i class="bi bi-check-circle-fill me-1"></i> {{ uploadSuccessMsg }}
                        </div>

                        <!-- Manual URL fallback input -->
                        <div class="input-group input-group-sm mt-2">
                          <span class="input-group-text"><i class="bi bi-link-45deg"></i> URL</span>
                          <input 
                            type="url" 
                            v-model.trim="form.photo_url" 
                            class="form-control" 
                            placeholder="https://..." 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Visi -->
                <div class="col-12">
                  <label class="form-label fw-semibold text-dark">Visi Paslon *</label>
                  <textarea 
                    v-model.trim="form.vision" 
                    rows="2" 
                    class="form-control" 
                    required 
                    placeholder="Tuliskan visi singkat paslon..."
                  ></textarea>
                </div>

                <!-- Misi -->
                <div class="col-12">
                  <label class="form-label fw-semibold text-dark">Misi Paslon (Gunakan penomoran 1, 2, 3...) *</label>
                  <textarea 
                    v-model.trim="form.mission" 
                    rows="4" 
                    class="form-control font-monospace small" 
                    required 
                    placeholder="1. Memajukan potensi siswa...&#10;2. Menjalin kerjasama..."
                  ></textarea>
                </div>

                <!-- Program Kerja -->
                <div class="col-12">
                  <label class="form-label fw-semibold text-dark">Program Kerja Unggulan</label>
                  <textarea 
                    v-model.trim="form.programs" 
                    rows="2" 
                    class="form-control" 
                    placeholder="Contoh: Pentas Seni, Liga OSIS, Mentoring Siswa"
                  ></textarea>
                </div>

              </div>

            </div>

            <div class="modal-footer p-3 bg-light">
              <button type="button" class="btn btn-secondary rounded-3 px-3" @click="closeModal" :disabled="isSaving">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 px-4 fw-bold shadow-sm" :disabled="isSaving || isUploading">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Data Paslon' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Paslon (Reactive In-App Dialog) -->
    <div 
      v-if="showDeleteModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;"
      @click.self="closeDeleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg text-center p-3">
          <div class="modal-body p-4" v-if="candidateToDelete">
            <div class="mb-3">
              <span class="badge bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                <i class="bi bi-trash3-fill display-5"></i>
              </span>
            </div>

            <h4 class="fw-bold mb-2 text-dark">Konfirmasi Hapus Paslon</h4>
            <p class="text-muted small mb-3">
              Apakah Anda yakin ingin menghapus data pasangan calon berikut?
            </p>

            <div class="p-3 bg-light rounded-3 border mb-4 text-start">
              <div class="badge bg-primary mb-2">Paslon #0{{ candidateToDelete.paslon_number }}</div>
              <h5 class="fw-bold text-dark mb-1">{{ candidateToDelete.leader_name }}</h5>
              <div class="text-secondary small">&amp; {{ candidateToDelete.co_leader_name }}</div>
            </div>

            <div class="d-flex gap-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary w-50 py-2 rounded-3 fw-semibold" 
                @click="closeDeleteModal"
                :disabled="isDeleting"
              >
                Batal
              </button>
              <button 
                type="button" 
                class="btn btn-danger w-50 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow" 
                @click="executeDeleteCandidate"
                :disabled="isDeleting"
              >
                <span v-if="isDeleting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-trash-fill"></i>
                <span>{{ isDeleting ? 'Menghapus...' : 'Ya, Hapus Sekarang' }}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { dbService, uploadFileToSupabase, isConfigured } from '../../supabase.js';

export default {
  name: 'ManajemenKandidat',
  data() {
    return {
      candidates: [],
      classes: [],
      isSupabaseActive: isConfigured,
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      isSaving: false,
      isDeleting: false,
      isUploading: false,
      uploadSuccessMsg: '',
      toastMessage: '',
      errorMessage: '',
      modalErrorMessage: '',
      candidateToDelete: null,
      copiedSql: false,
      defaultPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      form: {
        id: null,
        paslon_number: 1,
        leader_name: '',
        co_leader_name: '',
        class_leader: '',
        class_co_leader: '',
        photo_url: '',
        color_theme: '#0d6efd',
        vision: '',
        mission: '',
        programs: ''
      }
    };
  },
  computed: {
    isRlsError() {
      const msg = (this.modalErrorMessage || '').toLowerCase();
      return msg.includes('row-level security') || msg.includes('rls') || msg.includes('violates');
    }
  },
  async created() {
    await this.loadAll();
  },
  methods: {
    copyQuickSql() {
      const sql = `ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;`;
      navigator.clipboard.writeText(sql);
      this.copiedSql = true;
      setTimeout(() => { this.copiedSql = false; }, 3000);
    },
    async loadAll() {
      try {
        const [cands, cls] = await Promise.all([
          dbService.getCandidates(),
          dbService.getClasses()
        ]);
        this.candidates = cands;
        this.classes = cls;
      } catch (err) {
        console.error('Gagal memuat kandidat:', err);
        this.errorMessage = 'Gagal memuat data kandidat dari database.';
      }
    },
    openAddCandidateModal() {
      this.isEditing = false;
      this.uploadSuccessMsg = '';
      this.errorMessage = '';
      this.modalErrorMessage = '';
      const nextNum = (this.candidates.length > 0) 
        ? Math.max(...this.candidates.map(c => Number(c.paslon_number) || 0)) + 1 
        : 1;

      this.form = {
        id: null,
        paslon_number: nextNum,
        leader_name: '',
        co_leader_name: '',
        class_leader: this.classes[0]?.name || '',
        class_co_leader: this.classes[1]?.name || '',
        photo_url: '',
        color_theme: '#0d6efd',
        vision: '',
        mission: '',
        programs: ''
      };
      this.showModal = true;
    },
    openEditCandidateModal(cand) {
      this.isEditing = true;
      this.uploadSuccessMsg = '';
      this.errorMessage = '';
      this.modalErrorMessage = '';
      this.form = JSON.parse(JSON.stringify(cand));
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    confirmDeleteCandidate(cand) {
      this.candidateToDelete = cand;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.candidateToDelete = null;
    },
    async executeDeleteCandidate() {
      if (!this.candidateToDelete) return;
      this.isDeleting = true;
      try {
        await dbService.deleteCandidate(this.candidateToDelete.id);
        await this.loadAll();
        this.toastMessage = `Paslon No. ${this.candidateToDelete.paslon_number} (${this.candidateToDelete.leader_name}) berhasil dihapus.`;
        this.closeDeleteModal();
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        this.errorMessage = 'Gagal menghapus paslon: ' + (err.message || '');
      } finally {
        this.isDeleting = false;
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.isUploading = true;
      this.uploadSuccessMsg = '';

      try {
        const res = await uploadFileToSupabase(file, 'eosis-media', 'candidates');
        this.form.photo_url = res.url;
        this.uploadSuccessMsg = res.storageType === 'supabase'
          ? 'Berhasil diunggah ke Supabase Storage!'
          : 'Foto tersimpan ke memori media lokal!';
      } catch (err) {
        this.errorMessage = 'Gagal mengunggah foto: ' + (err.message || 'Error');
      } finally {
        this.isUploading = false;
      }
    },
    async saveCandidate() {
      this.isSaving = true;
      this.errorMessage = '';
      this.modalErrorMessage = '';

      if (!this.form.paslon_number || Number(this.form.paslon_number) < 1) {
        this.modalErrorMessage = 'Nomor urut paslon wajib diisi dengan angka minimal 1.';
        this.isSaving = false;
        return;
      }

      if (!this.form.leader_name || !this.form.leader_name.trim()) {
        this.modalErrorMessage = 'Nama Calon Ketua wajib diisi.';
        this.isSaving = false;
        return;
      }

      if (!this.form.co_leader_name || !this.form.co_leader_name.trim()) {
        this.modalErrorMessage = 'Nama Calon Wakil Ketua wajib diisi.';
        this.isSaving = false;
        return;
      }

      try {
        if (!this.form.photo_url) {
          this.form.photo_url = this.defaultPhoto;
        }

        await dbService.saveCandidate(this.form);
        await this.loadAll();
        this.toastMessage = `Data Paslon No. 0${this.form.paslon_number} (${this.form.leader_name}) berhasil disimpan ke database!`;
        this.closeModal();
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        console.error('Save candidate failed:', err);
        this.modalErrorMessage = err.message || 'Gagal menyimpan paslon ke database.';
      } finally {
        this.isSaving = false;
      }
    },
    onImageError(e) {
      e.target.src = this.defaultPhoto;
    }
  }
};
</script>
