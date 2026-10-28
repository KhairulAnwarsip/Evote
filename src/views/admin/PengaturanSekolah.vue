<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1">
          <i class="bi bi-gear-fill text-primary me-2"></i>Pengaturan Sekolah &amp; Supabase
        </h3>
        <p class="text-muted small mb-0">Konfigurasi data identitas sekolah, unggah logo, status pemilihan, dan koneksi Supabase</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <span 
          class="badge px-3 py-2 rounded-pill fw-semibold"
          :class="isSupabaseActive ? 'bg-success' : 'bg-warning text-dark'"
        >
          <i class="bi" :class="isSupabaseActive ? 'bi-database-check' : 'bi-hdd-fill'"></i>
          {{ isSupabaseActive ? 'Terhubung ke Supabase' : 'Mode Demo Storage Lokal' }}
        </span>
      </div>
    </div>

    <!-- Alert Notifications -->
    <div v-if="saveSuccess" class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-check-circle-fill fs-5"></i>
      <div><strong>Berhasil!</strong> Pengaturan sistem telah disimpan dan diperbarui.</div>
      <button type="button" class="btn-close" @click="saveSuccess = false"></button>
    </div>

    <div class="row g-4">
      
      <!-- Col Left: Identity & Logo Upload -->
      <div class="col-lg-7">
        
        <!-- Form Pengaturan Sekolah -->
        <div class="card card-eosis border-0 shadow-sm p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3">
            <i class="bi bi-building text-primary me-2"></i>Identitas Sekolah &amp; Pelaksanaan
          </h5>

          <form @submit.prevent="saveAllSettings">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Nama Resmi Sekolah *</label>
                <input type="text" v-model.trim="settings.school_name" class="form-control" required placeholder="Contoh: SMA NEGERI 1 NUSANTARA" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Slogan / Motto Sekolah</label>
                <input type="text" v-model.trim="settings.school_slogan" class="form-control" placeholder="Maju Bersama, Berprestasi" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Tahun Ajaran *</label>
                <input type="text" v-model.trim="settings.academic_year" class="form-control font-monospace" required placeholder="2026/2027" />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Judul Kegiatan Pemilihan *</label>
                <input type="text" v-model.trim="settings.election_title" class="form-control" required placeholder="Pemilihan Ketua & Wakil Ketua OSIS" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Tanggal Pemungutan Suara</label>
                <input type="date" v-model="settings.election_date" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Status Pemilihan</label>
                <select v-model="settings.election_status" class="form-select fw-semibold" :class="settings.election_status === 'open' ? 'text-success' : 'text-danger'">
                  <option value="open">DIBUKA (Siswa dapat mencoblos)</option>
                  <option value="closed">DITUTUP (Bilik suara dikunci)</option>
                </select>
              </div>

              <!-- Upload Logo Sekolah ke Supabase Storage -->
              <div class="col-12 mt-3">
                <div class="card bg-light border p-3 rounded-3">
                  <label class="form-label fw-bold text-primary mb-1">
                    <i class="bi bi-image-fill me-1"></i> Upload Logo Sekolah ke Supabase Storage
                  </label>
                  <div class="form-text mb-3">Format PNG, JPG, SVG, WebP. Logo akan tampil di surat suara, navbar, dan layar proyektor.</div>

                  <div class="row align-items-center g-3">
                    <div class="col-sm-3 text-center">
                      <img 
                        :src="settings.school_logo || defaultLogo" 
                        alt="Logo Sekolah" 
                        class="img-thumbnail rounded-3 bg-white shadow-sm"
                        style="width: 80px; height: 80px; object-fit: contain;"
                        @error="onLogoError"
                      />
                    </div>

                    <div class="col-sm-9">
                      <input 
                        type="file" 
                        class="form-control mb-2" 
                        accept="image/*" 
                        @change="handleLogoUpload"
                        :disabled="isUploadingLogo"
                      />

                      <div v-if="isUploadingLogo" class="text-primary small d-flex align-items-center gap-1 mb-1">
                        <span class="spinner-border spinner-border-sm" role="status"></span>
                        <span>Mengunggah logo ke storage...</span>
                      </div>
                      <div v-if="logoUploadMsg" class="text-success small mb-1">
                        <i class="bi bi-check-circle-fill me-1"></i> {{ logoUploadMsg }}
                      </div>

                      <div class="input-group input-group-sm">
                        <span class="input-group-text"><i class="bi bi-link"></i></span>
                        <input 
                          type="url" 
                          v-model.trim="settings.school_logo" 
                          class="form-control" 
                          placeholder="Atau tautan URL logo (https://...)" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Admin PIN Security -->
              <div class="col-md-6 mt-3">
                <label class="form-label fw-semibold">
                  <i class="bi bi-shield-lock-fill text-warning me-1"></i> PIN / Sandi Admin Panitia
                </label>
                <input 
                  type="text" 
                  v-model.trim="settings.admin_pin" 
                  class="form-control font-monospace fw-bold" 
                  required 
                  placeholder="PIN Masuk Admin (misal: 123456)" 
                />
                <div class="form-text">Gunakan kombinasi angka atau huruf yang aman.</div>
              </div>

            </div>

            <div class="mt-4 pt-3 border-top d-flex justify-content-end">
              <button type="submit" class="btn btn-primary px-4 fw-bold rounded-3 shadow-sm" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan' }}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      <!-- Col Right: Supabase Connection & SQL Script -->
      <div class="col-lg-5">
        
        <!-- Supabase Integration Settings -->
        <div class="card card-eosis border-0 shadow-sm p-4 mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold text-dark mb-0">
              <i class="bi bi-database-fill text-success me-2"></i>Konfigurasi Supabase SDK
            </h5>
            <span class="badge bg-light text-dark border">Client SDK</span>
          </div>

          <p class="small text-muted mb-3">
            Masukkan kredensial Supabase Project Anda untuk menghubungkan data langsung ke database PostgreSQL &amp; Supabase Storage.
          </p>

          <form @submit.prevent="saveSupabaseConfig">
            <div class="mb-3">
              <label class="form-label fw-semibold small">Supabase Project URL</label>
              <input 
                type="text" 
                v-model.trim="supabaseConfig.url" 
                class="form-control form-control-sm font-monospace" 
                placeholder="https://xyzcompany.supabase.co" 
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Supabase Anon Public Key</label>
              <textarea 
                v-model.trim="supabaseConfig.anonKey" 
                rows="3" 
                class="form-control form-control-sm font-monospace" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              ></textarea>
            </div>

            <div class="d-flex gap-2 mb-3">
              <button type="submit" class="btn btn-success btn-sm fw-bold rounded-2 flex-grow-1">
                <i class="bi bi-save me-1"></i> Simpan Kredensial Supabase
              </button>
              <button type="button" @click="resetSupabaseConfig" class="btn btn-outline-secondary btn-sm rounded-2">
                Reset
              </button>
            </div>

            <!-- Action: Test Connection & Seed Database -->
            <div class="pt-2 border-top">
              <div class="d-flex gap-2 mb-2">
                <button 
                  type="button" 
                  class="btn btn-outline-primary btn-sm rounded-2 flex-grow-1"
                  @click="testSupabaseConnection"
                  :disabled="isTestingConnection"
                >
                  <span v-if="isTestingConnection" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-activity me-1"></i>
                  <span>Uji Akses Database</span>
                </button>

                <button 
                  type="button" 
                  class="btn btn-outline-success btn-sm rounded-2"
                  @click="seedSupabaseData"
                  :disabled="isSeedingData"
                  title="Kirim data contoh Paslon, Kelas, dan Siswa ke database Supabase"
                >
                  <span v-if="isSeedingData" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-cloud-upload me-1"></i>
                  <span>Kirim Data Bawaan</span>
                </button>
              </div>

              <!-- Test Result Banner -->
              <div v-if="testResult" class="alert small p-2 rounded-2 mb-0 d-flex align-items-center gap-2" :class="testResult.success ? 'alert-success' : 'alert-danger'">
                <i :class="testResult.success ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
                <div style="font-size: 0.8rem;">{{ testResult.message }}</div>
              </div>
            </div>
          </form>
        </div>

        <!-- Solusi Cepat RLS Supabase (1-Klik Salin) -->
        <div class="card card-eosis border border-warning shadow-sm p-4 mb-4 bg-warning bg-opacity-10">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-dark mb-0">
              <i class="bi bi-shield-slash-fill text-warning me-2"></i>Solusi Cepat Akses Database (RLS)
            </h6>
            <button class="btn btn-sm btn-warning text-dark fw-bold py-1 px-3 rounded-2 shadow-sm" @click="copyRlsFix">
              <i class="bi" :class="copiedRlsLabel === 'Tersalin!' ? 'bi-check2' : 'bi-clipboard'"></i> {{ copiedRlsLabel }}
            </button>
          </div>
          <p class="small text-muted mb-2">
            Jika muncul pesan <code>violates row-level security policy</code> saat menambah kelas, siswa, atau paslon, salin dan jalankan perintah ini di <strong>SQL Editor</strong> dashboard Supabase Anda:
          </p>
          <pre class="bg-dark text-warning p-2 rounded-3 small font-monospace overflow-auto mb-2" style="font-size: 0.8rem;">ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;</pre>
          <div class="small text-muted">
            <i class="bi bi-info-circle-fill text-primary me-1"></i> Perintah ini membuka hak simpan/tulis bagi aplikasi eOSIS di bilik suara tanpa hambatan izin RLS.
          </div>
        </div>

        <!-- SQL Schema Helper Generator -->
        <div class="card card-eosis border-0 shadow-sm p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-dark mb-0">
              <i class="bi bi-code-square text-primary me-2"></i>Skrip SQL Schema Supabase
            </h6>
            <button class="btn btn-sm btn-outline-primary py-0 px-2 rounded-2" @click="copySqlSchema">
              <i class="bi bi-clipboard me-1"></i> {{ copySqlLabel }}
            </button>
          </div>
          <p class="small text-muted mb-2">
            Jalankan skrip ini di <strong>SQL Editor</strong> di dashboard Supabase Anda jika ingin membuat tabel dari awal:
          </p>

          <pre class="bg-dark text-light p-3 rounded-3 small font-monospace overflow-auto" style="max-height: 190px;">{{ sqlSchema }}</pre>
        </div>

        <!-- Dangerous Operations Zone -->
        <div class="card card-eosis border border-danger-subtle shadow-sm p-4">
          <h6 class="fw-bold text-danger mb-2">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> Zona Bahaya Pemilihan
          </h6>
          <p class="small text-muted mb-3">Tindakan ini permanen dan mempengaruhi suara yang telah terkumpul.</p>

          <div class="d-grid gap-2">
            <button type="button" @click="showResetVotesModal = true" class="btn btn-outline-danger btn-sm rounded-2 text-start">
              <i class="bi bi-trash-fill me-1"></i> Kosongkan / Reset Semua Perolehan Suara
            </button>
            <button type="button" @click="showFactoryResetModal = true" class="btn btn-outline-secondary btn-sm rounded-2 text-start">
              <i class="bi bi-arrow-repeat me-1"></i> Pulihkan Data Uji Coba Awal (Factory Reset)
            </button>
          </div>
        </div>

        <!-- Modal Konfirmasi Reset Suara -->
        <div v-if="showResetVotesModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow-lg text-center p-3">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <span class="badge bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                    <i class="bi bi-exclamation-triangle-fill display-5"></i>
                  </span>
                </div>
                <h4 class="fw-bold mb-2 text-dark">Kosongkan Semua Suara?</h4>
                <p class="text-muted small mb-4">
                  Semua suara sah yang telah masuk akan dihapus, dan status seluruh siswa akan dikembalikan menjadi <strong>Belum Memilih</strong>.
                </p>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-outline-secondary w-50 py-2 rounded-3" @click="showResetVotesModal = false">Batal</button>
                  <button type="button" class="btn btn-danger w-50 py-2 rounded-3 fw-bold" @click="executeResetVotes">Ya, Kosongkan Suara</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Konfirmasi Factory Reset -->
        <div v-if="showFactoryResetModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65); z-index: 1060;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow-lg text-center p-3">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <span class="badge bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                    <i class="bi bi-arrow-repeat display-5"></i>
                  </span>
                </div>
                <h4 class="fw-bold mb-2 text-dark">Pulihkan Data Awal?</h4>
                <p class="text-muted small mb-4">
                  Sistem akan mengembalikan seluruh data Paslon, Kelas, Siswa, dan Pengaturan ke konfigurasi contoh awal.
                </p>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-outline-secondary w-50 py-2 rounded-3" @click="showFactoryResetModal = false">Batal</button>
                  <button type="button" class="btn btn-warning w-50 py-2 rounded-3 fw-bold" @click="executeFactoryReset">Ya, Pulihkan Data</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { 
  dbService, 
  uploadFileToSupabase, 
  supabaseUrl, 
  supabaseAnonKey, 
  isConfigured 
} from '../../supabase.js';

export default {
  name: 'PengaturanSekolah',
  emits: ['refresh-settings'],
  data() {
    return {
      settings: {},
      supabaseConfig: {
        url: '',
        anonKey: ''
      },
      isSupabaseActive: false,
      isSaving: false,
      isTestingConnection: false,
      isSeedingData: false,
      testResult: null,
      isUploadingLogo: false,
      logoUploadMsg: '',
      saveSuccess: false,
      showResetVotesModal: false,
      showFactoryResetModal: false,
      copySqlLabel: 'Salin SQL',
      copiedRlsLabel: 'Salin Perintah RLS',
      sqlSchema: `-- ====================================================================
-- SKRIP STRUKTUR TABEL & AKSES KEAMANAN (RLS) EOSIS UNTUK SUPABASE
-- Salin seluruh teks ini dan jalankan di SQL Editor Supabase Dashboard Anda.
-- ====================================================================

-- LANGKAH UTAMA: BUKA AKSES PENULISAN (DISABLE RLS) AGAR BILIK SUARA DAPAT MENYIMPAN DATA
ALTER TABLE IF EXISTS classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS votes DISABLE ROW LEVEL SECURITY;

-- 1. Tabel Pengaturan Sekolah
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  school_name TEXT NOT NULL,
  school_slogan TEXT,
  academic_year TEXT,
  election_title TEXT,
  election_date DATE,
  election_status TEXT DEFAULT 'open',
  admin_pin TEXT DEFAULT '123456',
  school_logo TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Rombel / Kelas (Fase D SMP)
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  level TEXT DEFAULT 'Fase D'
);

-- 3. Tabel Kandidat Paslon
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  paslon_number INT NOT NULL UNIQUE,
  leader_name TEXT NOT NULL,
  co_leader_name TEXT NOT NULL,
  class_leader TEXT,
  class_co_leader TEXT,
  photo_url TEXT,
  color_theme TEXT DEFAULT '#0d6efd',
  vision TEXT,
  mission TEXT,
  programs TEXT
);

-- 4. Tabel DPT Siswa
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nisn TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  class_name TEXT,
  gender TEXT DEFAULT 'L',
  birth_date DATE NOT NULL,
  has_voted BOOLEAN DEFAULT false,
  voted_at TIMESTAMP WITH TIME ZONE
);

-- 5. Tabel Suara Sah Masuk
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  student_class TEXT,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 7. KEBIJAKAN AKSES PENUH UNTUK ANON & AUTHENTICATED (LUBER JURDIL)
DROP POLICY IF EXISTS "Allow anon all on settings" ON settings;
CREATE POLICY "Allow anon all on settings" ON settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on classes" ON classes;
CREATE POLICY "Allow anon all on classes" ON classes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on candidates" ON candidates;
CREATE POLICY "Allow anon all on candidates" ON candidates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on students" ON students;
CREATE POLICY "Allow anon all on students" ON students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on votes" ON votes;
CREATE POLICY "Allow anon all on votes" ON votes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. STORAGE BUCKET 'eosis-media' UNTUK FOTO PASLON & LOGO
INSERT INTO storage.buckets (id, name, public) 
VALUES ('eosis-media', 'eosis-media', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow anon upload on eosis-media" ON storage.objects;
CREATE POLICY "Allow anon upload on eosis-media" ON storage.objects 
FOR ALL TO anon, authenticated 
USING (bucket_id = 'eosis-media') 
WITH CHECK (bucket_id = 'eosis-media');`
    };
  },
  async created() {
    await this.loadSettings();
    this.supabaseConfig.url = supabaseUrl.includes('sample-project') ? '' : supabaseUrl;
    this.supabaseConfig.anonKey = supabaseAnonKey.includes('sample-anon') ? '' : supabaseAnonKey;
    this.isSupabaseActive = isConfigured;
  },
  methods: {
    async loadSettings() {
      this.settings = await dbService.getSettings();
    },
    async handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.isUploadingLogo = true;
      this.logoUploadMsg = '';

      try {
        const res = await uploadFileToSupabase(file, 'eosis-media', 'school');
        this.settings.school_logo = res.url;
        this.logoUploadMsg = res.storageType === 'supabase'
          ? 'Logo sukses diunggah ke Supabase Storage!'
          : 'Logo sukses tersimpan ke memori lokal!';
      } catch (err) {
        alert('Gagal mengunggah logo: ' + (err.message || ''));
      } finally {
        this.isUploadingLogo = false;
      }
    },
    async saveAllSettings() {
      this.isSaving = true;
      this.saveSuccess = false;
      try {
        await dbService.updateSettings(this.settings);
        this.saveSuccess = true;
        this.$emit('refresh-settings');
        setTimeout(() => { this.saveSuccess = false; }, 4000);
      } catch (err) {
        alert('Gagal menyimpan pengaturan: ' + (err.message || ''));
      } finally {
        this.isSaving = false;
      }
    },
    saveSupabaseConfig() {
      if (this.supabaseConfig.url && this.supabaseConfig.anonKey) {
        localStorage.setItem('eosis_supabase_config', JSON.stringify({
          url: this.supabaseConfig.url,
          anonKey: this.supabaseConfig.anonKey
        }));
        alert('Konfigurasi Supabase tersimpan! Halaman akan dimuat ulang untuk menghubungkan klien.');
        window.location.reload();
      } else {
        alert('Harap isi URL dan Anon Key Supabase.');
      }
    },
    resetSupabaseConfig() {
      if (confirm('Kembalikan ke mode demo lokal bawaan?')) {
        localStorage.removeItem('eosis_supabase_config');
        window.location.reload();
      }
    },
    copySqlSchema() {
      navigator.clipboard.writeText(this.sqlSchema);
      this.copySqlLabel = 'Tersalin!';
      setTimeout(() => { this.copySqlLabel = 'Salin SQL'; }, 2500);
    },
    copyRlsFix() {
      const sql = `ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;`;
      navigator.clipboard.writeText(sql);
      this.copiedRlsLabel = 'Tersalin!';
      setTimeout(() => { this.copiedRlsLabel = 'Salin Perintah RLS'; }, 2500);
    },
    async executeResetVotes() {
      try {
        await dbService.resetAllVotes();
        this.showResetVotesModal = false;
        this.saveSuccess = true;
        this.$emit('refresh-settings');
        setTimeout(() => { this.saveSuccess = false; }, 4000);
      } catch (err) {
        alert('Gagal mereset suara: ' + (err.message || ''));
      }
    },
    executeFactoryReset() {
      dbService.resetToFactoryDefaults();
      this.showFactoryResetModal = false;
      window.location.reload();
    },
    async testSupabaseConnection() {
      this.isTestingConnection = true;
      this.testResult = null;
      try {
        const res = await dbService.testSupabaseConnection();
        this.testResult = res;
      } catch (err) {
        this.testResult = {
          success: false,
          message: 'Gagal menguji koneksi: ' + (err.message || '')
        };
      } finally {
        this.isTestingConnection = false;
      }
    },
    async seedSupabaseData() {
      if (!confirm('Kirim seluruh data bawaan (Pengaturan, Kelas, Paslon, Siswa) ke database Supabase? Data yang ada akan ditimpa/diperbarui.')) return;
      this.isSeedingData = true;
      this.testResult = null;
      try {
        await dbService.seedSupabaseDatabase();
        this.testResult = {
          success: true,
          message: 'Seluruh data awal berhasil disinkronkan ke tabel database Supabase!'
        };
        this.$emit('refresh-settings');
      } catch (err) {
        this.testResult = {
          success: false,
          message: 'Gagal mengirim data awal: ' + (err.message || 'Periksa tabel dan RLS policy di Supabase')
        };
      } finally {
        this.isSeedingData = false;
      }
    },
    onLogoError(e) {
      e.target.src = this.defaultLogo;
    }
  }
};
</script>
