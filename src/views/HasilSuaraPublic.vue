<template>
  <div class="min-vh-100 bg-light py-4">
    <div class="container-fluid px-md-5">
      
      <!-- Big Screen Header -->
      <div class="card card-eosis border-0 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #db2777 0%, #9d174d 100%); color: white;">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div class="d-flex align-items-center gap-3">
            <img 
              :src="settings.school_logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80'" 
              alt="Logo Sekolah" 
              class="bg-white rounded-3 p-1"
              style="width: 58px; height: 58px; object-fit: cover;"
            />
            <div>
              <span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold text-uppercase mb-1">
                <i class="bi bi-broadcast me-1"></i> Live Count Pemilihan OSIS
              </span>
              <h2 class="fw-bold mb-0">{{ settings.school_name || 'SMA NEGERI 1 NUSANTARA' }}</h2>
              <small class="text-white-75">{{ settings.election_title }} &bull; Tahun Ajaran {{ settings.academic_year }}</small>
            </div>
          </div>

          <div class="d-flex align-items-center gap-3">
            <div class="text-end">
              <div class="badge bg-success px-3 py-2 fs-6 rounded-pill">
                <i class="bi bi-circle-fill text-light fs-8 me-1"></i> SIARAN LANGSUNG
              </div>
              <div class="text-white-50 fs-8 mt-1">Pembaruan otomatis tiap 5 detik</div>
            </div>

            <router-link to="/" class="btn btn-outline-light btn-sm rounded-3">
              <i class="bi bi-box-arrow-left me-1"></i> Kembali ke Beranda
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Counters -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card card-eosis border-0 shadow-sm p-3 text-center">
            <small class="text-muted text-uppercase fw-bold">Total DPT Siswa</small>
            <h2 class="fw-bold text-dark mb-0">{{ stats.totalDPT }}</h2>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="card card-eosis border-0 shadow-sm p-3 text-center">
            <small class="text-muted text-uppercase fw-bold">Total Suara Masuk</small>
            <h2 class="fw-bold text-success mb-0">{{ stats.totalVotes }}</h2>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="card card-eosis border-0 shadow-sm p-3 text-center">
            <small class="text-muted text-uppercase fw-bold">Belum Memilih</small>
            <h2 class="fw-bold text-warning mb-0">{{ stats.notVoted }}</h2>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="card card-eosis border-0 shadow-sm p-3 text-center">
            <small class="text-muted text-uppercase fw-bold">Tingkat Partisipasi</small>
            <h2 class="fw-bold text-primary mb-0">{{ stats.participationRate }}%</h2>
          </div>
        </div>
      </div>

      <!-- Candidate Standings Grid -->
      <div class="row g-4 mb-4">
        <div 
          v-for="cand in stats.candidateStats" 
          :key="cand.id" 
          class="col-md-6 col-lg-4"
        >
          <div class="card card-eosis border-0 shadow h-100 overflow-hidden text-center">
            <div class="p-3" :style="{ backgroundColor: cand.color_theme || '#0d6efd', color: '#fff' }">
              <span class="badge bg-white text-dark fs-5 fw-bold px-3 py-1 rounded-pill mb-1">
                NOMOR URUT #0{{ cand.paslon_number }}
              </span>
              <h5 class="fw-bold mb-0 mt-1">{{ cand.leader_name }}</h5>
              <div class="small text-white-75">&amp; {{ cand.co_leader_name }}</div>
            </div>

            <div class="p-3">
              <img 
                :src="cand.photo_url || defaultPhoto" 
                class="rounded-4 shadow-sm mb-3" 
                style="height: 180px; width: 100%; object-fit: cover;" 
                alt="Foto Paslon"
                @error="onImageError"
              />

              <div class="display-5 fw-bold text-dark mb-1">{{ cand.votes }}</div>
              <div class="text-muted small mb-2">Suara Sah</div>

              <div class="progress mb-2" style="height: 14px; border-radius: 8px;">
                <div 
                  class="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  :style="{ width: cand.percentage + '%', backgroundColor: cand.color_theme || '#0d6efd' }"
                ></div>
              </div>

              <span class="badge bg-light text-dark border fs-6 px-3 py-1">
                {{ cand.percentage }}% dari Suara Masuk
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Chart.js Charts -->
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card card-eosis border-0 shadow-sm p-4">
            <h5 class="fw-bold text-dark mb-3">
              <i class="bi bi-bar-chart-fill text-primary me-2"></i>Grafik Perolehan Suara Paslon
            </h5>
            <div class="chart-container-box">
              <canvas ref="publicBarCanvas"></canvas>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card card-eosis border-0 shadow-sm p-4">
            <h5 class="fw-bold text-dark mb-3">
              <i class="bi bi-pie-chart-fill text-primary me-2"></i>Diagram Lingkaran Suara
            </h5>
            <div class="chart-container-box d-flex align-items-center justify-content-center">
              <canvas ref="publicDoughnutCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import { dbService } from '../supabase.js';

export default {
  name: 'HasilSuaraPublic',
  data() {
    return {
      settings: {},
      stats: {
        totalDPT: 0,
        totalVotes: 0,
        notVoted: 0,
        participationRate: 0,
        candidateStats: []
      },
      timerId: null,
      barChart: null,
      doughnutChart: null,
      defaultPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    };
  },
  async mounted() {
    this.settings = await dbService.getSettings();
    await this.fetchData();
    this.timerId = setInterval(() => {
      this.fetchData();
    }, 5000);
  },
  beforeUnmount() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.barChart) this.barChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();
  },
  methods: {
    async fetchData() {
      try {
        this.stats = await dbService.getVoteStatistics();
        this.updateCharts();
      } catch (err) {
        console.error('Error fetching public stats:', err);
      }
    },
    updateCharts() {
      if (!this.stats.candidateStats || this.stats.candidateStats.length === 0) return;

      const labels = this.stats.candidateStats.map(c => `#0${c.paslon_number} ${c.leader_name.split(' ')[0]}`);
      const data = this.stats.candidateStats.map(c => c.votes);
      const colors = this.stats.candidateStats.map((c, i) => c.color_theme || ['#0d6efd', '#198754', '#6f42c1'][i % 3]);

      // Bar Chart
      const bCanvas = this.$refs.publicBarCanvas;
      if (bCanvas) {
        if (this.barChart) {
          this.barChart.data.labels = labels;
          this.barChart.data.datasets[0].data = data;
          this.barChart.data.datasets[0].backgroundColor = colors;
          this.barChart.update();
        } else {
          this.barChart = new Chart(bCanvas, {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                label: 'Jumlah Suara',
                data,
                backgroundColor: colors,
                borderRadius: 8
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
          });
        }
      }

      // Doughnut
      const dCanvas = this.$refs.publicDoughnutCanvas;
      if (dCanvas) {
        if (this.doughnutChart) {
          this.doughnutChart.data.labels = labels;
          this.doughnutChart.data.datasets[0].data = data;
          this.doughnutChart.data.datasets[0].backgroundColor = colors;
          this.doughnutChart.update();
        } else {
          this.doughnutChart = new Chart(dCanvas, {
            type: 'doughnut',
            data: {
              labels,
              datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              cutout: '60%'
            }
          });
        }
      }
    },
    onImageError(e) {
      e.target.src = this.defaultPhoto;
    }
  }
};
</script>
