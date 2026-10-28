<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1">
          <i class="bi bi-people-fill text-primary me-2"></i>Daftar Pemilih Tetap (DPT Siswa)
        </h3>
        <p class="text-muted small mb-0">Kelola data pemilih, periksa status hak suara, dan verifikasi identitas pemilih</p>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <span 
          class="badge px-3 py-2 rounded-pill fw-semibold"
          :class="isSupabaseActive ? 'bg-success' : 'bg-warning text-dark'"
        >
          <i class="bi" :class="isSupabaseActive ? 'bi-database-check' : 'bi-hdd-fill'"></i>
          {{ isSupabaseActive ? 'Database: Supabase Cloud' : 'Database: Penyimpanan Lokal' }}
        </span>

        <button class="btn btn-outline-success btn-sm rounded-3 px-3 py-2 fw-semibold" @click="openImportModal" title="Import data siswa dari file Excel / CSV">
          <i class="bi bi-file-earmark-excel-fill text-success me-1"></i> Import Excel
        </button>
        <button class="btn btn-outline-secondary btn-sm rounded-3 px-3 py-2 fw-semibold" @click="downloadExcelTemplate" title="Unduh format template Excel (.csv)">
          <i class="bi bi-download me-1"></i> Format Excel
        </button>
        <button class="btn btn-outline-secondary btn-sm rounded-3 px-3 py-2 fw-semibold" @click="generateDemoStudents" title="Tambahkan 3 siswa contoh">
          <i class="bi bi-magic me-1"></i> Generate Contoh DPT
        </button>
        <button class="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1 shadow-sm px-3 py-2 fw-semibold" @click="openAddStudentModal">
          <i class="bi bi-person-plus-fill"></i>
          <span>Tambah Siswa Baru</span>
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

    <!-- Filters & Search Toolbar -->
    <div class="card card-eosis border-0 shadow-sm p-3 mb-4">
      <div class="row g-2 align-items-center">
        <!-- Search bar -->
        <div class="col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-light"><i class="bi bi-search text-muted"></i></span>
            <input 
              type="text" 
              v-model.trim="searchQuery" 
              class="form-control" 
              placeholder="Cari berdasarkan NISN atau Nama Siswa..." 
            />
          </div>
        </div>

        <!-- Filter Kelas -->
        <div class="col-md-3">
          <select v-model="selectedClassFilter" class="form-select">
            <option value="">Semua Kelas ({{ classes.length }})</option>
            <option v-for="c in classes" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </div>

        <!-- Filter Status Memilih -->
        <div class="col-md-4">
          <select v-model="selectedStatusFilter" class="form-select">
            <option value="all">Semua Status Memilih</option>
            <option value="voted">Sudah Memilih ({{ countVoted }})</option>
            <option value="not_voted">Belum Memilih ({{ countNotVoted }})</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Student Table -->
    <div class="card card-eosis border-0 shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted small">
          Menampilkan <strong>{{ filteredStudents.length }}</strong> dari total <strong>{{ students.length }}</strong> DPT
        </span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 50px;">No</th>
              <th>NISN</th>
              <th>Nama Lengkap</th>
              <th>Kelas</th>
              <th>Tanggal Lahir</th>
              <th>Gender</th>
              <th>Status Hak Suara</th>
              <th class="text-end" style="width: 170px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(std, idx) in filteredStudents" :key="std.id">
              <td>{{ idx + 1 }}</td>
              <td class="font-monospace fw-bold text-primary">{{ std.nisn }}</td>
              <td class="fw-semibold text-dark">{{ std.full_name }}</td>
              <td><span class="badge bg-light text-dark border">{{ std.class_name }}</span></td>
              <td class="font-monospace small text-muted">{{ std.birth_date }}</td>
              <td>
                <span class="badge rounded-pill" :class="std.gender === 'L' ? 'bg-info-subtle text-info' : 'bg-danger-subtle text-danger'">
                  {{ std.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}
                </span>
              </td>
              <td>
                <span v-if="std.has_voted" class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  <i class="bi bi-check2-circle me-1"></i> Sudah Memilih
                </span>
                <span v-else class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">
                  <i class="bi bi-clock me-1"></i> Belum Memilih
                </span>
              </td>
              <td class="text-end text-nowrap">
                <!-- Reset Vote button -->
                <button 
                  v-if="std.has_voted" 
                  type="button"
                  class="btn btn-sm btn-outline-warning me-1 rounded-2" 
                  @click="confirmResetVote(std)" 
                  title="Batalkan / Reset Hak Suara"
                >
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <button 
                  type="button"
                  class="btn btn-sm btn-outline-primary me-1 rounded-2" 
                  @click="openEditStudentModal(std)" 
                  title="Edit Data Siswa"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button 
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-2" 
                  @click="confirmDeleteStudent(std)" 
                  title="Hapus Siswa dari DPT"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0">
              <td colspan="8" class="text-center text-muted py-4">
                Tidak ada data siswa yang cocok dengan kriteria pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah/Edit Siswa (Reactive Vue Modal) -->
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
              <i class="bi bi-person-fill-gear me-2"></i>{{ isEditing ? 'Edit Data Pemilih' : 'Tambah Pemilih Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveStudent">
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

              <!-- Warning if no classes exist yet -->
              <div v-if="classes.length === 0" class="alert alert-warning small d-flex align-items-center gap-2 mb-3">
                <i class="bi bi-exclamation-circle-fill fs-5 text-warning flex-shrink-0"></i>
                <div>
                  <strong>Belum ada kelas terdaftar!</strong> Silakan buat kelas terlebih dahulu di menu <em>Manajemen Kelas</em>.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold text-dark">NISN (Nomor Induk Siswa Nasional) *</label>
                <input 
                  type="text" 
                  v-model.trim="form.nisn" 
                  class="form-control font-monospace" 
                  required 
                  placeholder="Contoh: 0078901234" 
                />
                <div class="form-text">Digunakan sebagai username saat siswa login.</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold text-dark">Nama Lengkap Siswa *</label>
                <input 
                  type="text" 
                  v-model.trim="form.full_name" 
                  class="form-control" 
                  required 
                  placeholder="Nama lengkap sesuai data Dapodik" 
                />
              </div>

              <div class="row g-2 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Kelas *</label>
                  <select v-model="form.class_name" class="form-select" required>
                    <option value="" disabled>Pilih Kelas</option>
                    <option v-for="c in classes" :key="c.id" :value="c.name">{{ c.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Jenis Kelamin</label>
                  <select v-model="form.gender" class="form-select">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold text-dark">Tanggal Lahir (YYYY-MM-DD) *</label>
                <input 
                  type="date" 
                  v-model="form.birth_date" 
                  class="form-control font-monospace" 
                  required 
                />
                <div class="form-text">Digunakan sebagai tanggal verifikasi login siswa.</div>
              </div>

              <div v-if="isEditing" class="form-check form-switch p-3 bg-light rounded-3 border">
                <input class="form-check-input ms-0 me-2" type="checkbox" id="votedSwitch" v-model="form.has_voted">
                <label class="form-check-label fw-semibold" for="votedSwitch">Telah Menggunakan Hak Suara</label>
              </div>

            </div>

            <div class="modal-footer p-3 bg-light">
              <button type="button" class="btn btn-secondary rounded-3 px-3" @click="closeModal" :disabled="isSaving">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 fw-bold px-4 shadow-sm" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambahkan ke DPT' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Siswa (Reactive In-App Dialog) -->
    <div 
      v-if="showDeleteModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;"
      @click.self="closeDeleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg text-center p-3">
          <div class="modal-body p-4" v-if="studentToDelete">
            <div class="mb-3">
              <span class="badge bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                <i class="bi bi-trash3-fill display-5"></i>
              </span>
            </div>

            <h4 class="fw-bold mb-2 text-dark">Hapus Siswa dari DPT</h4>
            <p class="text-muted small mb-3">
              Apakah Anda yakin ingin menghapus siswa ini dari Daftar Pemilih Tetap?
            </p>

            <!-- Delete error banner -->
            <div v-if="deleteErrorMessage" class="alert alert-danger d-flex align-items-center gap-2 mb-3 text-start" role="alert">
              <i class="bi bi-exclamation-triangle-fill text-danger flex-shrink-0"></i>
              <div class="small fw-semibold">{{ deleteErrorMessage }}</div>
            </div>

            <div class="p-3 bg-light rounded-3 border mb-4 text-start small">
              <div class="fw-bold text-dark fs-6">{{ studentToDelete.full_name }}</div>
              <div class="text-muted">NISN: <span class="font-monospace fw-semibold">{{ studentToDelete.nisn }}</span> &bull; Kelas: {{ studentToDelete.class_name }}</div>
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
                @click="executeDeleteStudent"
                :disabled="isDeleting"
              >
                <span v-if="isDeleting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-trash-fill"></i>
                <span>{{ isDeleting ? 'Menghapus...' : 'Ya, Hapus Siswa' }}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Reset Suara Siswa (Reactive In-App Dialog) -->
    <div 
      v-if="showResetModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;"
      @click.self="closeResetModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg text-center p-3">
          <div class="modal-body p-4" v-if="studentToReset">
            <div class="mb-3">
              <span class="badge bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                <i class="bi bi-arrow-counterclockwise display-5"></i>
              </span>
            </div>

            <h4 class="fw-bold mb-2 text-dark">Reset Hak Suara Siswa</h4>
            <p class="text-muted small mb-3">
              Suara yang telah dicoblos oleh siswa ini akan dibatalkan, dan siswa dapat mencoblos kembali di bilik suara.
            </p>

            <!-- Reset error banner -->
            <div v-if="resetErrorMessage" class="alert alert-danger d-flex align-items-center gap-2 mb-3 text-start" role="alert">
              <i class="bi bi-exclamation-triangle-fill text-danger flex-shrink-0"></i>
              <div class="small fw-semibold">{{ resetErrorMessage }}</div>
            </div>

            <div class="p-3 bg-light rounded-3 border mb-4 text-start small">
              <div class="fw-bold text-dark fs-6">{{ studentToReset.full_name }}</div>
              <div class="text-muted">NISN: <span class="font-monospace fw-semibold">{{ studentToReset.nisn }}</span> &bull; Kelas: {{ studentToReset.class_name }}</div>
            </div>

            <div class="d-flex gap-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary w-50 py-2 rounded-3 fw-semibold" 
                @click="closeResetModal"
                :disabled="isResetting"
              >
                Batal
              </button>
              <button 
                type="button" 
                class="btn btn-warning w-50 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow" 
                @click="executeResetVote"
                :disabled="isResetting"
              >
                <span v-if="isResetting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-arrow-counterclockwise"></i>
                <span>{{ isResetting ? 'Mereset...' : 'Ya, Reset Suara' }}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal Import Excel / CSV -->
    <div 
      v-if="showImportModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;"
      @click.self="closeImportModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <div class="modal-header bg-success text-white p-4">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-file-earmark-excel-fill me-2"></i>Import Data Siswa DPT dari Excel / CSV
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeImportModal"></button>
          </div>

          <div class="modal-body p-4">
            <!-- Instructions -->
            <div class="alert alert-success bg-success-subtle text-dark border border-success-subtle p-3 rounded-3 mb-4">
              <h6 class="fw-bold mb-2"><i class="bi bi-info-circle-fill text-success me-1"></i> Panduan Format Impor Data:</h6>
              <p class="small mb-2">
                Unggah file berformat <strong>.CSV</strong> atau <strong>.TXT</strong> (dapat diexport langsung dari Microsoft Excel melalui Save As -> CSV (Comma Delimited)).
              </p>
              <p class="small mb-2 fw-semibold">Format Kolom / Baris Header (Urutan Bebas):</p>
              <code class="d-block bg-white p-2 rounded border small text-dark font-monospace mb-2">nisn, full_name, class_name, gender, birth_date</code>
              <div class="small text-muted">
                Contoh isi baris data: <code>0078901234, Ahmad Rizki Maulana, VII-A, L, 2011-05-14</code>
              </div>
            </div>

            <!-- Import Error / Success Messages -->
            <div v-if="importErrorMessage" class="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill fs-5 text-danger flex-shrink-0"></i>
              <div class="small fw-semibold">{{ importErrorMessage }}</div>
            </div>

            <div v-if="importSuccessMessage" class="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
              <i class="bi bi-check-circle-fill fs-5 text-success flex-shrink-0"></i>
              <div class="small fw-semibold">{{ importSuccessMessage }}</div>
            </div>

            <!-- File Picker -->
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark">Pilih Berkas Excel / CSV *</label>
              <input 
                type="file" 
                ref="fileInput" 
                class="form-control" 
                accept=".csv, .txt, .xlsx, .xls" 
                @change="handleFileSelected"
              />
            </div>

            <!-- Preview Table -->
            <div v-if="previewRows.length > 0" class="mb-3">
              <h6 class="fw-bold text-dark mb-2">Pratinjau Data Impor ({{ previewRows.length }} Siswa Ditemukan):</h6>
              <div class="table-responsive border rounded-3" style="max-height: 220px;">
                <table class="table table-sm table-hover align-middle mb-0 small">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>NISN</th>
                      <th>Nama Lengkap</th>
                      <th>Kelas</th>
                      <th>Gender</th>
                      <th>Tgl Lahir</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in previewRows" :key="idx">
                      <td class="font-monospace fw-bold text-primary">{{ row.nisn }}</td>
                      <td class="fw-semibold">{{ row.full_name }}</td>
                      <td><span class="badge bg-light text-dark border">{{ row.class_name }}</span></td>
                      <td>{{ row.gender }}</td>
                      <td class="font-monospace">{{ row.birth_date }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div class="modal-footer p-3 bg-light">
            <button type="button" class="btn btn-secondary rounded-3 px-3" @click="closeImportModal" :disabled="isImporting">Batal</button>
            <button 
              type="button" 
              class="btn btn-success rounded-3 fw-bold px-4 shadow-sm d-flex align-items-center gap-2" 
              @click="executeImportStudents"
              :disabled="isImporting || previewRows.length === 0"
            >
              <span v-if="isImporting" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="bi bi-cloud-arrow-up-fill"></i>
              <span>{{ isImporting ? 'Mengimpor Data...' : `Impor ${previewRows.length} Siswa ke DPT` }}</span>
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { dbService, isConfigured } from '../../supabase.js';

export default {
  name: 'ManajemenSiswa',
  data() {
    return {
      students: [],
      classes: [],
      searchQuery: '',
      selectedClassFilter: '',
      selectedStatusFilter: 'all',
      showModal: false,
      showDeleteModal: false,
      showResetModal: false,
      isEditing: false,
      isSaving: false,
      isDeleting: false,
      isResetting: false,
      isSupabaseActive: isConfigured,
      studentToDelete: null,
      studentToReset: null,
      toastMessage: '',
      errorMessage: '',
      modalErrorMessage: '',
      deleteErrorMessage: '',
      resetErrorMessage: '',
      copiedSql: false,
      showImportModal: false,
      isImporting: false,
      importErrorMessage: '',
      importSuccessMessage: '',
      previewRows: [],
      form: {
        id: null,
        nisn: '',
        full_name: '',
        class_name: '',
        birth_date: '2010-01-01',
        gender: 'L',
        has_voted: false
      }
    };
  },
  computed: {
    isRlsError() {
      const msg = (this.modalErrorMessage || '').toLowerCase();
      return msg.includes('row-level security') || msg.includes('rls') || msg.includes('violates');
    },
    countVoted() {
      return this.students.filter(s => s.has_voted).length;
    },
    countNotVoted() {
      return this.students.filter(s => !s.has_voted).length;
    },
    filteredStudents() {
      let list = [...this.students];

      // Search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(s => 
          (s.nisn && s.nisn.toLowerCase().includes(q)) ||
          (s.full_name && s.full_name.toLowerCase().includes(q))
        );
      }

      // Class filter
      if (this.selectedClassFilter) {
        list = list.filter(s => s.class_name === this.selectedClassFilter);
      }

      // Status filter
      if (this.selectedStatusFilter === 'voted') {
        list = list.filter(s => s.has_voted);
      } else if (this.selectedStatusFilter === 'not_voted') {
        list = list.filter(s => !s.has_voted);
      }

      return list;
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
        const [stds, cls] = await Promise.all([
          dbService.getStudents(),
          dbService.getClasses()
        ]);
        this.students = stds;
        this.classes = cls;
        this.isSupabaseActive = isConfigured;
      } catch (err) {
        console.error('Gagal memuat siswa:', err);
        this.errorMessage = 'Gagal memuat data siswa.';
      }
    },
    openAddStudentModal() {
      this.isEditing = false;
      this.errorMessage = '';
      this.modalErrorMessage = '';
      this.form = {
        id: null,
        nisn: '',
        full_name: '',
        class_name: this.classes[0]?.name || '',
        birth_date: '2010-01-01',
        gender: 'L',
        has_voted: false
      };
      this.showModal = true;
    },
    openEditStudentModal(std) {
      this.isEditing = true;
      this.errorMessage = '';
      this.modalErrorMessage = '';
      this.form = JSON.parse(JSON.stringify(std));
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.modalErrorMessage = '';
    },
    confirmDeleteStudent(std) {
      this.studentToDelete = std;
      this.deleteErrorMessage = '';
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.studentToDelete = null;
      this.deleteErrorMessage = '';
    },
    async executeDeleteStudent() {
      if (!this.studentToDelete) return;
      this.isDeleting = true;
      this.deleteErrorMessage = '';
      try {
        await dbService.deleteStudent(this.studentToDelete.id);
        await this.loadData();
        this.toastMessage = `Siswa ${this.studentToDelete.full_name} (${this.studentToDelete.nisn}) berhasil dihapus dari DPT.`;
        this.closeDeleteModal();
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        this.deleteErrorMessage = err.message || 'Gagal menghapus siswa dari database.';
      } finally {
        this.isDeleting = false;
      }
    },
    confirmResetVote(std) {
      this.studentToReset = std;
      this.resetErrorMessage = '';
      this.showResetModal = true;
    },
    closeResetModal() {
      this.showResetModal = false;
      this.studentToReset = null;
      this.resetErrorMessage = '';
    },
    async executeResetVote() {
      if (!this.studentToReset) return;
      this.isResetting = true;
      this.resetErrorMessage = '';
      try {
        await dbService.resetStudentVote(this.studentToReset.id);
        await this.loadData();
        this.toastMessage = `Hak suara ${this.studentToReset.full_name} berhasil di-reset. Siswa dapat mencoblos kembali.`;
        this.closeResetModal();
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        this.resetErrorMessage = err.message || 'Gagal mereset suara siswa di database.';
      } finally {
        this.isResetting = false;
      }
    },
    async saveStudent() {
      this.isSaving = true;
      this.errorMessage = '';
      this.modalErrorMessage = '';

      if (!this.form.nisn || !this.form.nisn.trim()) {
        this.modalErrorMessage = 'NISN siswa wajib diisi.';
        this.isSaving = false;
        return;
      }

      if (!this.form.full_name || !this.form.full_name.trim()) {
        this.modalErrorMessage = 'Nama lengkap siswa wajib diisi.';
        this.isSaving = false;
        return;
      }

      if (!this.form.class_name) {
        this.modalErrorMessage = 'Silakan pilih kelas untuk siswa ini.';
        this.isSaving = false;
        return;
      }

      if (!this.form.birth_date) {
        this.modalErrorMessage = 'Tanggal lahir wajib diisi untuk verifikasi login.';
        this.isSaving = false;
        return;
      }

      try {
        await dbService.saveStudent(this.form);
        await this.loadData();
        this.toastMessage = `Data pemilih ${this.form.full_name} berhasil disimpan!`;
        this.closeModal();
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        console.error('Gagal menyimpan siswa:', err);
        this.modalErrorMessage = err.message || 'Gagal menyimpan data siswa ke database.';
      } finally {
        this.isSaving = false;
      }
    },
    async generateDemoStudents() {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const newDemos = [
        {
          id: `std-demo-${Date.now()}-1`,
          nisn: `0089${randomId}1`,
          full_name: 'Daffa Pratama Putra',
          class_name: this.classes[0]?.name || 'VII-A',
          gender: 'L',
          birth_date: '2011-04-12',
          has_voted: false
        },
        {
          id: `std-demo-${Date.now()}-2`,
          nisn: `0089${randomId}2`,
          full_name: 'Clarissa Amanda',
          class_name: this.classes[1]?.name || 'VIII-A',
          gender: 'P',
          birth_date: '2010-10-25',
          has_voted: false
        },
        {
          id: `std-demo-${Date.now()}-3`,
          nisn: `0089${randomId}3`,
          full_name: 'Raffi Surya Kusuma',
          class_name: this.classes[2]?.name || 'IX-A',
          gender: 'L',
          birth_date: '2009-12-08',
          has_voted: false
        }
      ];

      try {
        for (const d of newDemos) {
          await dbService.saveStudent(d);
        }
        await this.loadData();
        this.toastMessage = '3 siswa contoh berhasil ditambahkan ke DPT!';
        setTimeout(() => { this.toastMessage = ''; }, 4000);
      } catch (err) {
        this.errorMessage = 'Gagal menambahkan siswa contoh: ' + (err.message || '');
      }
    },
    downloadExcelTemplate() {
      const csvContent = "nisn,full_name,class_name,gender,birth_date\n0078901234,Ahmad Rizki Maulana,VII-A,L,2011-05-14\n0078901235,Siti Nurhaliza,VII-B,P,2011-08-20\n0078901236,Dimas Bagas Pratama,VIII-A,L,2010-01-11";
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'template_dpt_eosis.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    openImportModal() {
      this.importErrorMessage = '';
      this.importSuccessMessage = '';
      this.previewRows = [];
      this.showImportModal = true;
    },
    closeImportModal() {
      this.showImportModal = false;
      this.previewRows = [];
    },
    handleFileSelected(event) {
      this.importErrorMessage = '';
      this.importSuccessMessage = '';
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length < 2) {
            this.importErrorMessage = 'File kosong atau tidak memiliki baris data / header.';
            return;
          }

          // Parse header
          const header = lines[0].toLowerCase().split(',').map(h => h.trim());
          const nisnIdx = header.findIndex(h => h.includes('nisn'));
          const nameIdx = header.findIndex(h => h.includes('name') || h.includes('nama'));
          const classIdx = header.findIndex(h => h.includes('class') || h.includes('kelas') || h.includes('romb')) ;
          const genderIdx = header.findIndex(h => h.includes('gender') || h.includes('kelamin') || h.includes('jk'));
          const birthIdx = header.findIndex(h => h.includes('birth') || h.includes('lahir') || h.includes('tanggal'));

          if (nisnIdx === -1 || nameIdx === -1 || classIdx === -1) {
            this.importErrorMessage = 'Format header CSV tidak valid. Pastikan ada kolom nisn, full_name, dan class_name.';
            return;
          }

          const parsed = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            if (cols.length >= 3 && cols[nisnIdx]) {
              parsed.push({
                nisn: cols[nisnIdx],
                full_name: cols[nameIdx] || 'Siswa',
                class_name: cols[classIdx] || this.classes[0]?.name || 'VII-A',
                gender: (cols[genderIdx] && cols[genderIdx].toUpperCase().startsWith('P')) ? 'P' : 'L',
                birth_date: (cols[birthIdx] && /^\d{4}-\d{2}-\d{2}$/.test(cols[birthIdx])) ? cols[birthIdx] : '2010-01-01',
                has_voted: false
              });
            }
          }

          if (parsed.length === 0) {
            this.importErrorMessage = 'Tidak ada data valid yang dapat dibaca dari file CSV.';
            return;
          }

          this.previewRows = parsed;
          this.importSuccessMessage = `Berhasil membaca ${parsed.length} data siswa dari file. Klik "Impor" di bawah untuk menyimpan.`;
        } catch (err) {
          this.importErrorMessage = 'Gagal membaca file: ' + err.message;
        }
      };
      reader.onerror = () => {
        this.importErrorMessage = 'Gagal membaca berkas.';
      };
      reader.readAsText(file);
    },
    async executeImportStudents() {
      if (this.previewRows.length === 0) return;
      this.isImporting = true;
      this.importErrorMessage = '';

      try {
        let count = 0;
        for (const s of this.previewRows) {
          await dbService.saveStudent({
            ...s,
            id: `std-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
          });
          count++;
        }

        await this.loadData();
        this.importSuccessMessage = `Sukses! ${count} data siswa berhasil diimpor ke DPT.`;
        this.toastMessage = `${count} siswa berhasil diimpor ke DPT!`;
        setTimeout(() => {
          this.closeImportModal();
          this.toastMessage = '';
        }, 2000);
      } catch (err) {
        this.importErrorMessage = 'Gagal menyimpan data impor ke database: ' + (err.message || '');
      } finally {
        this.isImporting = false;
      }
    }
  }
};
</script>
