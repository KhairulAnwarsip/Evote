<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1">
          <i class="bi bi-building text-primary me-2"></i>Manajemen Kelas
        </h3>
        <p class="text-muted small mb-0">Kelola daftar rombongan belajar (rombel) dan pantau partisipasi per kelas</p>
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
          @click="openAddClassModal"
        >
          <i class="bi bi-plus-circle-fill"></i>
          <span>Tambah Kelas Baru</span>
        </button>
      </div>
    </div>

    <!-- Toast / Alerts -->
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

    <!-- Kelas Table & Summary -->
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card card-eosis border-0 shadow-sm p-4">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 50px;">No</th>
                  <th>Nama Kelas</th>
                  <th>Tingkat</th>
                  <th>Jumlah Siswa</th>
                  <th>Suara Masuk</th>
                  <th class="text-end" style="width: 140px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cls, idx) in classesWithStats" :key="cls.id">
                  <td>{{ idx + 1 }}</td>
                  <td class="fw-bold text-dark fs-6">{{ cls.name }}</td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary border">
                      {{ cls.level || 'Fase D' }}
                    </span>
                  </td>
                  <td>
                    <span class="fw-semibold">{{ cls.studentCount }}</span> Siswa
                  </td>
                  <td>
                    <span class="badge bg-success-subtle text-success border">
                      {{ cls.votedCount }} Memilih ({{ cls.percentage }}%)
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button 
                      type="button"
                      class="btn btn-sm btn-outline-primary me-2 rounded-2 px-2 py-1" 
                      @click="openEditClassModal(cls)"
                      title="Edit Kelas"
                    >
                      <i class="bi bi-pencil-square me-1"></i>Edit
                    </button>
                    <button 
                      type="button"
                      class="btn btn-sm btn-outline-danger rounded-2 px-2 py-1" 
                      @click="confirmDeleteClass(cls)"
                      title="Hapus Kelas"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="classesWithStats.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">Belum ada kelas terdaftar. Klik "Tambah Kelas Baru" untuk menambahkan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Class Statistics Summary Box -->
      <div class="col-lg-4">
        <div class="card card-eosis border-0 shadow-sm p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart text-primary me-2"></i>Ringkasan Rombel</h5>
          
          <div class="d-flex justify-content-between p-2 border-bottom">
            <span class="text-muted">Total Kelas:</span>
            <strong>{{ classes.length }} Rombel</strong>
          </div>
          <div class="d-flex justify-content-between p-2 border-bottom">
            <span class="text-muted">Total Siswa Terdaftar:</span>
            <strong>{{ totalStudents }} Siswa</strong>
          </div>
          <div class="d-flex justify-content-between p-2">
            <span class="text-muted">Rata-rata per Kelas:</span>
            <strong>{{ averagePerClass }} Siswa</strong>
          </div>
        </div>

        <div class="card card-eosis border-0 shadow-sm p-4 bg-primary text-white" style="background: linear-gradient(135deg, #1e3a8a, #2563eb) !important;">
          <h6 class="fw-bold mb-2"><i class="bi bi-info-circle-fill me-1"></i> Tips Panitia:</h6>
          <p class="small text-white-75 mb-0">
            Pastikan nama kelas konsisten dengan yang ada di berkas DPT Siswa untuk memudahkan filter pemungutan suara per kelas.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Form Tambah/Edit Kelas (Reactive Vue Modal) -->
    <div 
      v-if="showModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1055;"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <div class="modal-header bg-primary text-white p-4">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-building-add me-2"></i>{{ isEditing ? 'Edit Data Kelas' : 'Tambah Kelas Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveClass">
            <div class="modal-body p-4">
              <!-- Error in Modal with RLS Quick-Fix -->
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
                    Tabel di database Supabase Anda memiliki fitur Row Level Security yang masih aktif tanpa izin tulis. Salin dan jalankan skrip di bawah ini pada menu <strong>SQL Editor</strong> di dashboard Supabase Anda:
                  </p>
                  <pre class="bg-dark text-warning p-2 rounded small font-monospace mb-2 user-select-all" style="font-size: 0.78rem;">ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
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

              <div class="mb-3">
                <label class="form-label fw-semibold text-dark">Nama Kelas / Rombel *</label>
                <input 
                  type="text" 
                  v-model.trim="form.name" 
                  class="form-control" 
                  required 
                  placeholder="Contoh: VII-A, VIII-B, IX-C" 
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold text-dark">Tingkat Kelas</label>
                <select v-model="form.level" class="form-select">
                  <option value="Fase D">Fase D</option>
                  <option value="Lainnya/Guru/Staf">Lainnya/Guru/Staf</option>
                </select>
              </div>
            </div>

            <div class="modal-footer p-3 bg-light">
              <button type="button" class="btn btn-secondary rounded-3 px-3" @click="closeModal" :disabled="isSaving">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 fw-bold px-4 shadow-sm" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambah Kelas' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Kelas (Reactive In-App Dialog) -->
    <div 
      v-if="showDeleteModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;"
      @click.self="closeDeleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg text-center p-3">
          <div class="modal-body p-4" v-if="classToDelete">
            <div class="mb-3">
              <span class="badge bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                <i class="bi bi-trash3-fill display-5"></i>
              </span>
            </div>

            <h4 class="fw-bold mb-2 text-dark">Konfirmasi Hapus Kelas</h4>
            <p class="text-muted small mb-3">
              Apakah Anda yakin ingin menghapus kelas <strong>{{ classToDelete.name }}</strong>?
            </p>

            <!-- Delete error banner -->
            <div v-if="deleteErrorMessage" class="alert alert-danger d-flex align-items-center gap-2 mb-3 text-start" role="alert">
              <i class="bi bi-exclamation-triangle-fill text-danger flex-shrink-0"></i>
              <div class="small fw-semibold">{{ deleteErrorMessage }}</div>
            </div>

            <div class="p-3 bg-light rounded-3 border mb-4 text-start small">
              <div class="text-muted mb-1">Rombel: <strong>{{ classToDelete.name }} (Tingkat {{ classToDelete.level }})</strong></div>
              <div class="text-danger"><i class="bi bi-exclamation-circle-fill me-1"></i> Data kelas yang dihapus tidak dapat dipulihkan.</div>
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
                @click="executeDeleteClass"
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
import { dbService, isConfigured } from '../../supabase.js';

export default {
  name: 'ManajemenKelas',
  data() {
    return {
      classes: [],
      students: [],
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      isSaving: false,
      isDeleting: false,
      isSupabaseActive: isConfigured,
      classToDelete: null,
      toastMessage: '',
      errorMessage: '',
      modalErrorMessage: '',
      deleteErrorMessage: '',
      copiedSql: false,
      form: {
        id: null,
        name: '',
        level: 'Fase D'
      }
    };
  },
  computed: {
    isRlsError() {
      const msg = (this.modalErrorMessage || '').toLowerCase();
      return msg.includes('row-level security') || msg.includes('rls') || msg.includes('violates');
    },
    totalStudents() {
      return this.students.length;
    },
    averagePerClass() {
      if (this.classes.length === 0) return 0;
      return Math.round(this.students.length / this.classes.length);
    },
    classesWithStats() {
      return this.classes.map(cls => {
        const classStudents = this.students.filter(s => s.class_name === cls.name);
        const voted = classStudents.filter(s => s.has_voted).length;
        const total = classStudents.length;
        const pct = total > 0 ? ((voted / total) * 100).toFixed(0) : 0;
        return {
          ...cls,
          studentCount: total,
          votedCount: voted,
          percentage: pct
        };
      });
    }
  },
  async created() {
    await this.loadData();
  },
  methods: {
    copyQuickSql() {
      const sql = `ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;`;
      navigator.clipboard.writeText(sql);
      this.copiedSql = true;
      setTimeout(() => { this.copiedSql = false; }, 3000);
    },
    async loadData() {
      try {
        const [cls, std] = await Promise.all([
          dbService.getClasses(),
          dbService.getStudents()
        ]);
        this.classes = cls;
        this.students = std;
        this.isSupabaseActive = isConfigured;
      } catch (err) {
        console.error('Gagal memuat kelas:', err);
        this.errorMessage = 'Gagal memuat data kelas.';
      }
    },
    openAddClassModal() {
      this.isEditing = false;
      this.errorMessage = '';
      this.modalErrorMessage = '';
      this.form = { id: null, name: '', level: 'Fase D' };
      this.showModal = true;
    },
    openEditClassModal(cls) {
      this.isEditing = true;
      this.errorMessage = '';
      this.modalErrorMessage = '';
      this.form = { ...cls };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.modalErrorMessage = '';
    },
    confirmDeleteClass(cls) {
      this.classToDelete = cls;
      this.deleteErrorMessage = '';
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.classToDelete = null;
      this.deleteErrorMessage = '';
    },
    async executeDeleteClass() {
      if (!this.classToDelete) return;
      this.isDeleting = true;
      this.deleteErrorMessage = '';
      try {
        await dbService.deleteClass(this.classToDelete.id);
        await this.loadData();
        this.toastMessage = `Kelas ${this.classToDelete.name} berhasil dihapus.`;
        this.closeDeleteModal();
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        this.deleteErrorMessage = err.message || 'Gagal menghapus kelas dari database.';
      } finally {
        this.isDeleting = false;
      }
    },
    async saveClass() {
      this.isSaving = true;
      this.errorMessage = '';
      this.modalErrorMessage = '';

      if (!this.form.name || !this.form.name.trim()) {
        this.modalErrorMessage = 'Nama kelas / rombel wajib diisi.';
        this.isSaving = false;
        return;
      }

      try {
        await dbService.saveClass(this.form);
        await this.loadData();
        this.toastMessage = `Kelas ${this.form.name} berhasil disimpan!`;
        this.closeModal();
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        console.error('Gagal menyimpan kelas:', err);
        this.modalErrorMessage = err.message || 'Gagal menyimpan data kelas ke database.';
      } finally {
        this.isSaving = false;
      }
    }
  }
};
</script>
