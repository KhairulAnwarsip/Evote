<template>
  <div>
    <!-- Top Header & Status Toggle -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1">
          <i class="bi bi-speedometer2 text-primary me-2"></i>Dashboard Panitia OSIS
        </h3>
        <p class="text-muted small mb-0">Ringkasan statistik pelaksanaan pemilihan dan pemantauan DPT secara langsung</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- Toggle Election Status -->
        <button 
          @click="toggleElectionStatus" 
          class="btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
          :class="settings.election_status === 'open' ? 'btn-success' : 'btn-danger'"
        >
          <i :class="settings.election_status === 'open' ? 'bi bi-unlock-fill' : 'bi bi-lock-fill'"></i>
          <span>{{ settings.election_status === 'open' ? 'Pemilihan AKTIF (Buka)' : 'Pemilihan DITUTUP' }}</span>
        </button>

        <button @click="loadData" class="btn btn-sm btn-outline-secondary rounded-3" title="Perbarui Data">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- 4 Key Stat Widgets -->
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="stat-widget">
          <div class="stat-icon bg-primary bg-opacity-10 text-primary">
            <i class="bi bi-people-fill"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold">Total Pemilih (DPT)</div>
            <h3 class="fw-bold mb-0 text-dark">{{ stats.totalDPT }}</h3>
            <small class="text-muted">Siswa terdaftar</small>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="stat-widget">
          <div class="stat-icon bg-success bg-opacity-10 text-success">
            <i class="bi bi-check2-all"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold">Suara Masuk</div>
            <h3 class="fw-bold mb-0 text-success">{{ stats.totalVotes }}</h3>
            <small class="text-success fw-semibold">{{ stats.participationRate }}% Partisipasi</small>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="stat-widget">
          <div class="stat-icon bg-warning bg-opacity-10 text-warning">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold">Belum Memilih</div>
            <h3 class="fw-bold mb-0 text-warning">{{ stats.notVoted }}</h3>
            <small class="text-muted">Siswa tersisa</small>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="stat-widget">
          <div class="stat-icon bg-info bg-opacity-10 text-info">
            <i class="bi bi-person-vcard-fill"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold">Pasangan Calon</div>
            <h3 class="fw-bold mb-0 text-dark">{{ candidates.length }}</h3>
            <small class="text-muted">Kandidat bersaing</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Candidate Standing Mini-Progress -->
    <div class="row g-4 mb-4">
      <div class="col-lg-7">
        <div class="card card-eosis border-0 h-100 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-trophy-fill text-warning me-2"></i>Perolehan Suara Paslon Sementara</h5>
            <router-link to="/admin/perolehan-suara" class="btn btn-sm btn-outline-primary rounded-pill">
              Detail Grafik &raquo;
            </router-link>
          </div>

          <div v-if="stats.candidateStats && stats.candidateStats.length > 0" class="d-flex flex-column gap-3">
            <div 
              v-for="cand in stats.candidateStats" 
              :key="cand.id" 
              class="p-3 bg-light rounded-3 border"
            >
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-primary rounded-pill">#0{{ cand.paslon_number }}</span>
                  <strong class="text-dark">{{ cand.leader_name }} &amp; {{ cand.co_leader_name }}</strong>
                </div>
                <div class="text-end">
                  <span class="fw-bold text-primary fs-5">{{ cand.votes }}</span>
                  <span class="text-muted small ms-1">suara ({{ cand.percentage }}%)</span>
                </div>
              </div>
              
              <!-- Progress bar -->
              <div class="progress" style="height: 10px; border-radius: 6px;">
                <div 
                  class="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  :style="{ width: cand.percentage + '%', backgroundColor: cand.color_theme || '#0d6efd' }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-muted py-4">
            Belum ada kandidat terdaftar.
          </div>
        </div>
      </div>

      <!-- Quick Actions and System Status -->
      <div class="col-lg-5">
        <div class="card card-eosis border-0 h-100 p-4">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-lightning-charge-fill text-primary me-2"></i>Aksi Cepat Panitia</h5>

          <div class="d-grid gap-2 mb-4">
            <router-link to="/admin/siswa" class="btn btn-outline-primary py-2 text-start rounded-3 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-person-plus-fill me-2"></i> Tambah / Kelola DPT Siswa</span>
              <i class="bi bi-chevron-right"></i>
            </router-link>

            <router-link to="/admin/kandidat" class="btn btn-outline-success py-2 text-start rounded-3 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-card-image me-2"></i> Tambah / Edit Paslon Kandidat</span>
              <i class="bi bi-chevron-right"></i>
            </router-link>

            <router-link to="/admin/perolehan-suara" class="btn btn-outline-info py-2 text-start rounded-3 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-pie-chart-fill me-2"></i> Buka Grafik Interaktif Chart.js</span>
              <i class="bi bi-chevron-right"></i>
            </router-link>

            <router-link to="/hasil-suara" target="_blank" class="btn btn-primary py-2 text-start rounded-3 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-display me-2"></i> Buka Layar Proyektor (Live Count)</span>
              <i class="bi bi-box-arrow-up-right"></i>
            </router-link>
          </div>

          <div class="mt-auto p-3 bg-light rounded-3 border small">
            <div class="fw-bold mb-1 text-dark"><i class="bi bi-info-circle me-1"></i> Informasi Database:</div>
            <div class="text-muted">
              Penyimpanan tersinkronisasi otomatis melalui <strong>Supabase Client SDK</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Voters List -->
    <div class="card card-eosis border-0 p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history text-primary me-2"></i>Aktivitas Pemilih Terbaru</h5>
        <router-link to="/admin/siswa" class="btn btn-sm btn-outline-secondary rounded-pill">Lihat Semua DPT</router-link>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Waktu Mencoblos</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="std in recentVoters" :key="std.id">
              <td class="font-monospace fw-semibold">{{ std.nisn }}</td>
              <td>{{ std.full_name }}</td>
              <td><span class="badge bg-light text-dark border">{{ std.class_name }}</span></td>
              <td class="text-muted small">{{ formatDateTime(std.voted_at) }}</td>
              <td>
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  <i class="bi bi-check-circle me-1"></i> Sudah Memilih
                </span>
              </td>
            </tr>
            <tr v-if="recentVoters.length === 0">
              <td colspan="5" class="text-center text-muted py-3">Belum ada siswa yang menggunakan hak pilih.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import { dbService } from '../../supabase.js';

export default {
  name: 'DashboardAdmin',
  emits: ['refresh-settings'],
  data() {
    return {
      stats: {
        totalDPT: 0,
        totalVotes: 0,
        notVoted: 0,
        participationRate: 0,
        candidateStats: []
      },
      candidates: [],
      students: [],
      settings: {},
      recentVoters: []
    };
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const [statsData, candData, stdData, setts] = await Promise.all([
          dbService.getVoteStatistics(),
          dbService.getCandidates(),
          dbService.getStudents(),
          dbService.getSettings()
        ]);
        this.stats = statsData;
        this.candidates = candData;
        this.students = stdData;
        this.settings = setts;

        // Filter recent voters
        this.recentVoters = stdData
          .filter(s => s.has_voted)
          .sort((a, b) => new Date(b.voted_at || 0) - new Date(a.voted_at || 0))
          .slice(0, 5);
      } catch (err) {
        console.error('Gagal memuat statistik dashboard:', err);
      }
    },
    async toggleElectionStatus() {
      const nextStatus = this.settings.election_status === 'open' ? 'closed' : 'open';
      this.settings.election_status = nextStatus;
      await dbService.updateSettings(this.settings);
      this.$emit('refresh-settings');
    },
    formatDateTime(dt) {
      if (!dt) return '-';
      try {
        return new Date(dt).toLocaleString('id-ID', {
          dateStyle: 'short',
          timeStyle: 'medium'
        });
      } catch {
        return dt;
      }
    }
  }
};
</script>
