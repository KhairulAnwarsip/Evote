<template>
  <div>
    <!-- Top Header & Controls -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold text-dark mb-1">
          <i class="bi bi-graph-up-arrow text-primary me-2"></i>Perolehan Suara Real-time (Chart.js)
        </h3>
        <p class="text-muted small mb-0">Visualisasi data perolehan suara sah secara langsung menggunakan grafik interaktif</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <div class="form-check form-switch bg-white p-2 px-3 border rounded-3 shadow-sm d-flex align-items-center gap-2">
          <input class="form-check-input ms-0" type="checkbox" id="autoRefreshSwitch" v-model="autoRefresh" @change="handleAutoRefreshToggle">
          <label class="form-check-label small fw-semibold" for="autoRefreshSwitch">Auto-Refresh (5s)</label>
        </div>

        <button @click="loadData" class="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1 shadow-sm px-3 py-2">
          <i class="bi bi-arrow-clockwise"></i>
          <span>Perbarui</span>
        </button>

        <!-- Main Button: Cetak Berita Acara -->
        <button @click="openPrintModal" class="btn btn-dark btn-sm rounded-3 d-flex align-items-center gap-1 shadow-sm px-3 py-2 fw-semibold">
          <i class="bi bi-printer-fill"></i>
          <span>Cetak Berita Acara</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="p-3 bg-white rounded-3 border shadow-sm text-center">
          <div class="text-muted small fw-semibold">Total Pemilih (DPT)</div>
          <div class="display-6 fw-bold text-dark">{{ stats.totalDPT }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 bg-white rounded-3 border shadow-sm text-center">
          <div class="text-muted small fw-semibold">Total Suara Masuk</div>
          <div class="display-6 fw-bold text-success">{{ stats.totalVotes }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 bg-white rounded-3 border shadow-sm text-center">
          <div class="text-muted small fw-semibold">Belum Memilih</div>
          <div class="display-6 fw-bold text-warning">{{ stats.notVoted }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 bg-white rounded-3 border shadow-sm text-center">
          <div class="text-muted small fw-semibold">Tingkat Partisipasi</div>
          <div class="display-6 fw-bold text-primary">{{ stats.participationRate }}%</div>
        </div>
      </div>
    </div>

    <!-- Chart.js Section -->
    <div class="row g-4 mb-4">
      <!-- Bar Chart -->
      <div class="col-lg-8">
        <div class="card card-eosis border-0 shadow-sm p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0">
              <i class="bi bi-bar-chart-fill text-primary me-2"></i>Grafik Batang Perolehan Suara
            </h5>
            <small class="text-muted">Terakhir diperbarui: {{ stats.lastUpdated }}</small>
          </div>

          <div class="chart-container-box">
            <canvas ref="barChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Doughnut Chart -->
      <div class="col-lg-4">
        <div class="card card-eosis border-0 shadow-sm p-4 h-100">
          <h5 class="fw-bold text-dark mb-3">
            <i class="bi bi-pie-chart-fill text-primary me-2"></i>Proporsi Suara (%)
          </h5>

          <div class="chart-container-box d-flex align-items-center justify-content-center">
            <canvas ref="doughnutChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Candidate Detailed Results Table -->
    <div class="card card-eosis border-0 shadow-sm p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-dark mb-0">
          <i class="bi bi-table text-primary me-2"></i>Rincian Rekapitulasi Suara Paslon
        </h5>
        <button @click="openPrintModal" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="bi bi-file-earmark-text me-1"></i> Format Berita Acara Resmi
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 80px;">No Urut</th>
              <th style="width: 70px;">Foto</th>
              <th>Nama Calon Ketua & Wakil</th>
              <th>Asal Rombel</th>
              <th class="text-center">Jumlah Suara Sah</th>
              <th class="text-center">Persentase</th>
              <th class="text-end">Visualisasi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cand in sortedCandidateStats" :key="cand.id">
              <td class="text-center">
                <span class="badge bg-primary fs-6 px-3 py-2 rounded-3">#0{{ cand.paslon_number }}</span>
              </td>
              <td>
                <img 
                  :src="cand.photo_url || defaultPhoto" 
                  alt="Foto" 
                  class="rounded-circle border" 
                  style="width: 48px; height: 48px; object-fit: cover;" 
                  @error="onImageError"
                />
              </td>
              <td>
                <div class="fw-bold text-dark fs-6">{{ cand.leader_name }}</div>
                <small class="text-muted">&amp; {{ cand.co_leader_name }}</small>
              </td>
              <td>
                <span class="badge bg-light text-dark border">{{ cand.class_leader }} / {{ cand.class_co_leader }}</span>
              </td>
              <td class="text-center">
                <span class="fs-5 fw-bold text-success">{{ cand.votes }}</span>
                <span class="text-muted small"> suara</span>
              </td>
              <td class="text-center">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6">
                  {{ cand.percentage }}%
                </span>
              </td>
              <td class="text-end" style="min-width: 150px;">
                <div class="progress" style="height: 12px; border-radius: 6px;">
                  <div 
                    class="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    :style="{ width: cand.percentage + '%', backgroundColor: cand.color_theme || '#0d6efd' }"
                  ></div>
                </div>
              </td>
            </tr>
            <tr v-if="!sortedCandidateStats || sortedCandidateStats.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Belum ada kandidat terdaftar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL PRATINJAU CETAK BERITA ACARA RESMI (Reactive Vue Modal) -->
    <div 
      v-if="showPrintModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(15, 23, 42, 0.7); z-index: 1060;"
      @click.self="closePrintModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <!-- Modal Toolbar -->
          <div class="modal-header bg-dark text-white p-3 px-4 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-printer-fill fs-5 text-warning"></i>
              <h5 class="modal-title fw-bold mb-0">Pratinjau Berita Acara &amp; Lembar Rekapitulasi Suara</h5>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-outline-light btn-sm rounded-2" @click="downloadReportHtml">
                <i class="bi bi-download me-1"></i> Unduh Berkas (.html)
              </button>
              <button type="button" class="btn btn-warning btn-sm rounded-2 fw-bold text-dark px-3" @click="printDocument">
                <i class="bi bi-printer me-1"></i> Cetak / Simpan PDF
              </button>
              <button type="button" class="btn-close btn-close-white ms-2" @click="closePrintModal"></button>
            </div>
          </div>

          <!-- Document Container for Print & Preview -->
          <div class="modal-body p-4 bg-light" style="max-height: 75vh; overflow-y: auto;">
            
            <div id="officialReportDoc" class="bg-white p-4 p-md-5 rounded-3 shadow-sm mx-auto" style="max-width: 850px; font-family: 'Times New Roman', serif; color: #111;">
              
              <!-- KOP SURAT SEKOLAH RESMI -->
              <div class="d-flex align-items-center pb-3 mb-4" style="border-bottom: 3px double #000;">
                <img 
                  :src="settings.school_logo || defaultPhoto" 
                  alt="Logo" 
                  style="width: 75px; height: 75px; object-fit: contain;" 
                  class="me-4"
                  @error="onImageError"
                />
                <div class="flex-grow-1 text-center pe-md-4">
                  <h4 class="fw-bold mb-0 text-uppercase" style="letter-spacing: 0.5px;">{{ settings.school_name || 'PEMERINTAH KABUPATEN / KOTA' }}</h4>
                  <h5 class="fw-bold mb-1 text-uppercase">PANITIA PEMILIHAN KETUA &amp; WAKIL KETUA OSIS</h5>
                  <div class="small mb-0" style="font-size: 13px;">{{ settings.school_slogan || 'Maju Bersama, Berintegritas & Berprestasi' }}</div>
                  <div class="small text-muted" style="font-size: 12px;">Tahun Ajaran {{ settings.academic_year || '2026/2027' }} &bull; Tanggal: {{ formattedCurrentDate }}</div>
                </div>
              </div>

              <!-- JUDUL BERITA ACARA -->
              <div class="text-center mb-4">
                <h5 class="fw-bold text-decoration-underline mb-1 text-uppercase">BERITA ACARA PEMUNGUTAN DAN PENGHITUNGAN SUARA</h5>
                <div class="small">Nomor: {{ reportNumber }}</div>
              </div>

              <!-- PARAGRAF PEMBUKA -->
              <p class="text-justify mb-3" style="line-height: 1.6; font-size: 14px;">
                Pada hari ini <strong>{{ currentDayName }}</strong> tanggal <strong>{{ formattedCurrentDate }}</strong>, bertempat di lingkungan sekolah <strong>{{ settings.school_name }}</strong>, Panitia Pemilihan OSIS telah melaksanakan proses pemungutan dan penghitungan suara secara elektronik (eOSIS) untuk menetapkan Pasangan Calon Ketua dan Wakil Ketua OSIS Periode <strong>{{ settings.academic_year || '2026/2027' }}</strong>.
              </p>

              <!-- I. DATA PEMILIH (DPT) -->
              <h6 class="fw-bold mb-2" style="font-size: 14px;">I. REKAPITULASI DATA PEMILIH &amp; PARTISIPASI</h6>
              <table class="table table-bordered mb-4" style="border-color: #333; font-size: 13px;">
                <tbody>
                  <tr>
                    <td style="width: 40px;" class="text-center fw-bold">1</td>
                    <td style="width: 320px;">Jumlah Pemilih Terdaftar dalam DPT</td>
                    <td class="text-end font-monospace fw-bold">{{ stats.totalDPT }}</td>
                    <td>Orang Siswa</td>
                  </tr>
                  <tr>
                    <td class="text-center fw-bold">2</td>
                    <td>Jumlah Suara Sah yang Masuk (Menggunakan Hak Suara)</td>
                    <td class="text-end font-monospace fw-bold text-success">{{ stats.totalVotes }}</td>
                    <td>Suara Sah</td>
                  </tr>
                  <tr>
                    <td class="text-center fw-bold">3</td>
                    <td>Jumlah Siswa yang Belum / Tidak Menggunakan Hak Suara</td>
                    <td class="text-end font-monospace fw-bold">{{ stats.notVoted }}</td>
                    <td>Orang Siswa</td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td class="text-center fw-bold">4</td>
                    <td class="fw-bold">Tingkat Partisipasi Siswa</td>
                    <td class="text-end font-monospace fw-bold">{{ stats.participationRate }}%</td>
                    <td class="fw-bold">Persen Partisipasi</td>
                  </tr>
                </tbody>
              </table>

              <!-- II. PEROLEHAN SUARA MASING-MASING PASLON -->
              <h6 class="fw-bold mb-2" style="font-size: 14px;">II. HASIL PEROLEHAN SUARA PASANGAN CALON</h6>
              <table class="table table-bordered mb-4" style="border-color: #333; font-size: 13px;">
                <thead style="background-color: #f0f0f0;">
                  <tr class="text-center align-middle">
                    <th style="width: 50px;">No Urut</th>
                    <th>Nama Pasangan Calon (Ketua &amp; Wakil)</th>
                    <th style="width: 130px;">Asal Rombel</th>
                    <th style="width: 130px;">Jumlah Suara Sah</th>
                    <th style="width: 100px;">Persentase</th>
                    <th style="width: 120px;">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(cand, idx) in sortedCandidateStats" :key="cand.id" class="align-middle">
                    <td class="text-center fw-bold fs-6">0{{ cand.paslon_number }}</td>
                    <td>
                      <strong>{{ cand.leader_name }}</strong><br />
                      <small class="text-muted">&amp; {{ cand.co_leader_name }}</small>
                    </td>
                    <td class="text-center">{{ cand.class_leader }} / {{ cand.class_co_leader }}</td>
                    <td class="text-center font-monospace fw-bold fs-6">{{ cand.votes }}</td>
                    <td class="text-center font-monospace fw-bold">{{ cand.percentage }}%</td>
                    <td class="text-center">
                      <span v-if="idx === 0 && cand.votes > 0" class="badge bg-success text-white">
                        TERPILIH
                      </span>
                      <span v-else class="text-muted small">Peringkat {{ idx + 1 }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- III. PENETAPAN HASIL -->
              <div v-if="winnerCandidate && winnerCandidate.votes > 0" class="p-3 mb-4 rounded-2" style="border: 1px dashed #333; background-color: #fafafa; font-size: 13.5px;">
                <strong>PENETAPAN:</strong><br />
                Berdasarkan hasil penghitungan suara di atas, Panitia Pemilihan menetapkan bahwa Pasangan Calon Nomor Urut <strong>0{{ winnerCandidate.paslon_number }}</strong> atas nama <strong>{{ winnerCandidate.leader_name }}</strong> dan <strong>{{ winnerCandidate.co_leader_name }}</strong> dinyatakan sebagai <strong>KETUA DAN WAKIL KETUA OSIS TERPILIH</strong> Periode {{ settings.academic_year || '2026/2027' }}.
              </div>

              <!-- KOLOM TANDA TANGAN RESMI -->
              <div class="row text-center mt-5" style="font-size: 13px;">
                <div class="col-4">
                  <p class="mb-5">Ketua Panitia Pemilihan,</p>
                  <div class="fw-bold text-decoration-underline">( ........................................ )</div>
                  <small class="text-muted">NISN / NIP: ...........................</small>
                </div>
                <div class="col-4">
                  <p class="mb-5">Saksi Perwakilan Paslon,</p>
                  <div class="fw-bold text-decoration-underline">( ........................................ )</div>
                  <small class="text-muted">Saksi Umum / MPK</small>
                </div>
                <div class="col-4">
                  <p class="mb-5">Mengetahui,<br>Pembina OSIS,</p>
                  <div class="fw-bold text-decoration-underline">( ........................................ )</div>
                  <small class="text-muted">NIP: .......................................</small>
                </div>
              </div>

            </div>

          </div>

          <!-- Modal Footer -->
          <div class="modal-footer p-3 bg-light d-flex justify-content-between">
            <span class="small text-muted">
              <i class="bi bi-info-circle me-1"></i> Berita Acara dapat dicetak ke kertas A4 atau disimpan dalam format PDF.
            </span>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-secondary rounded-3 px-3" @click="closePrintModal">Tutup</button>
              <button type="button" class="btn btn-dark rounded-3 px-4 fw-bold" @click="printDocument">
                <i class="bi bi-printer me-1"></i> Cetak Berita Acara
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import { markRaw } from 'vue';
import { dbService } from '../../supabase.js';

export default {
  name: 'PerolehanSuara',
  data() {
    return {
      settings: {},
      stats: {
        totalDPT: 0,
        totalVotes: 0,
        notVoted: 0,
        participationRate: 0,
        candidateStats: [],
        lastUpdated: ''
      },
      autoRefresh: true,
      timerId: null,
      barChartInstance: null,
      doughnutChartInstance: null,
      showPrintModal: false,
      defaultPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    };
  },
  computed: {
    sortedCandidateStats() {
      if (!this.stats.candidateStats) return [];
      return [...this.stats.candidateStats].sort((a, b) => b.votes - a.votes);
    },
    winnerCandidate() {
      return this.sortedCandidateStats.length > 0 ? this.sortedCandidateStats[0] : null;
    },
    formattedCurrentDate() {
      return new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
    currentDayName() {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[new Date().getDay()];
    },
    reportNumber() {
      const year = new Date().getFullYear();
      return `BA-OSIS/${year}/XI/${String(this.stats.totalVotes).padStart(3, '0')}`;
    }
  },
  async mounted() {
    this.settings = await dbService.getSettings();
    await this.loadData();
    this.startAutoRefresh();
  },
  beforeUnmount() {
    this.stopAutoRefresh();
    if (this.barChartInstance) this.barChartInstance.destroy();
    if (this.doughnutChartInstance) this.doughnutChartInstance.destroy();
  },
  methods: {
    async loadData() {
      try {
        const [statsData, settingsData] = await Promise.all([
          dbService.getVoteStatistics(),
          dbService.getSettings()
        ]);
        this.stats = statsData;
        this.settings = settingsData;
        this.renderCharts();
      } catch (err) {
        console.error('Gagal mengambil statistik perolehan suara:', err);
      }
    },
    handleAutoRefreshToggle() {
      if (this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
    startAutoRefresh() {
      this.stopAutoRefresh();
      this.timerId = setInterval(() => {
        this.loadData();
      }, 5000);
    },
    stopAutoRefresh() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    },
    renderCharts() {
      if (!this.stats.candidateStats || this.stats.candidateStats.length === 0) return;

      const labels = this.stats.candidateStats.map(c => `#0${c.paslon_number} ${c.leader_name.split(' ')[0]}`);
      const voteCounts = this.stats.candidateStats.map(c => c.votes);
      const bgColors = this.stats.candidateStats.map((c, i) => c.color_theme || ['#0d6efd', '#198754', '#6f42c1', '#fd7e14', '#0dcaf0'][i % 5]);

      // 1. Render Bar Chart
      const barCanvas = this.$refs.barChartCanvas;
      if (barCanvas) {
        if (this.barChartInstance) {
          this.barChartInstance.data.labels = labels;
          this.barChartInstance.data.datasets[0].data = voteCounts;
          this.barChartInstance.data.datasets[0].backgroundColor = bgColors;
          this.barChartInstance.update();
        } else {
          this.barChartInstance = markRaw(new Chart(barCanvas, {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                label: 'Jumlah Suara Sah',
                data: voteCounts,
                backgroundColor: bgColors,
                borderRadius: 8,
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => ` ${context.raw} Suara Sah`
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 }
                }
              }
            }
          }));
        }
      }

      // 2. Render Doughnut Chart
      const doughnutCanvas = this.$refs.doughnutChartCanvas;
      if (doughnutCanvas) {
        if (this.doughnutChartInstance) {
          this.doughnutChartInstance.data.labels = labels;
          this.doughnutChartInstance.data.datasets[0].data = voteCounts;
          this.doughnutChartInstance.data.datasets[0].backgroundColor = bgColors;
          this.doughnutChartInstance.update();
        } else {
          this.doughnutChartInstance = markRaw(new Chart(doughnutCanvas, {
            type: 'doughnut',
            data: {
              labels,
              datasets: [{
                data: voteCounts,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { boxWidth: 12, font: { size: 11 } }
                }
              },
              cutout: '65%'
            }
          }));
        }
      }
    },
    openPrintModal() {
      this.showPrintModal = true;
    },
    closePrintModal() {
      this.showPrintModal = false;
    },
    printDocument() {
      // 1. Try opening dedicated print window to avoid iframe restriction
      const docEl = document.getElementById('officialReportDoc');
      if (!docEl) {
        window.print();
        return;
      }

      try {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
              <meta charset="UTF-8">
              <title>Berita Acara Pemilihan OSIS - ${this.settings.school_name || 'eOSIS'}</title>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
              <style>
                body { font-family: 'Times New Roman', serif; color: #000; padding: 25px; margin: 0; background: #fff; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #222 !important; padding: 7px 10px; font-size: 13px; }
                th { background-color: #f2f2f2 !important; text-align: center; }
                @media print {
                  body { padding: 10px; }
                }
              </style>
            </head>
            <body>
              ${docEl.innerHTML}
              <script>
                window.onload = function() {
                  window.focus();
                  window.print();
                };
              <\/script>
            </body>
            </html>
          `);
          printWindow.document.close();
          return;
        }
      } catch (e) {
        console.warn('Popup print blocked, falling back to window.print():', e);
      }

      // Fallback
      window.print();
    },
    downloadReportHtml() {
      const docEl = document.getElementById('officialReportDoc');
      if (!docEl) return;

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Berita Acara Pemilihan OSIS - ${this.settings.school_name || 'eOSIS'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <style>
    body { font-family: 'Times New Roman', serif; color: #000; padding: 35px; background: #fdfdfd; }
    .print-doc { max-width: 850px; margin: 0 auto; background: #fff; padding: 30px; border: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #222 !important; padding: 7px 10px; font-size: 13px; }
    th { background-color: #f2f2f2 !important; text-align: center; }
    @media print {
      body { padding: 0; background: #fff; }
      .print-doc { border: none; padding: 0; }
      .no-print-toolbar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar text-center mb-4">
    <button onclick="window.print()" class="btn btn-primary px-4 py-2 fw-bold">
      Cetak Halaman Ini / Simpan sebagai PDF
    </button>
  </div>
  <div class="print-doc">
    ${docEl.innerHTML}
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Berita_Acara_Pemilihan_OSIS_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onImageError(e) {
      e.target.src = this.defaultPhoto;
    }
  }
};
</script>

<style scoped>
@media print {
  /* Hide all elements during browser print except official document */
  body * {
    visibility: hidden;
  }
  #officialReportDoc, #officialReportDoc * {
    visibility: visible !important;
  }
  #officialReportDoc {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
