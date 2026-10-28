<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Main School Header / Navbar -->
    <header class="navbar-eosis text-white sticky-top py-2 px-3">
      <div class="container-fluid d-flex flex-wrap align-items-center justify-content-between">
        
        <!-- School Identity & Brand -->
        <router-link to="/" class="d-flex align-items-center text-white text-decoration-none me-3">
          <img 
            :src="settings.school_logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80'" 
            alt="Logo Sekolah" 
            class="school-logo-img me-2 bg-white"
            @error="onLogoError"
          />
          <div>
            <div class="fw-bold fs-6 lh-1">{{ settings.school_name || 'SMA NEGERI 1 NUSANTARA' }}</div>
            <small class="text-white-50 fs-8">{{ settings.election_title || 'Pemilihan OSIS Digital' }}</small>
          </div>
        </router-link>

        <!-- Right Quick Links & Session Info -->
        <div class="d-flex align-items-center gap-2 mt-2 mt-md-0">
          
          <!-- Election Status Badge -->
          <span 
            class="badge d-flex align-items-center gap-1 px-3 py-2"
            :class="settings.election_status === 'open' ? 'bg-success' : 'bg-danger'"
          >
            <span class="spinner-grow spinner-grow-sm text-light" style="width: 8px; height: 8px;" v-if="settings.election_status === 'open'"></span>
            <i class="bi bi-lock-fill" v-else></i>
            <span>{{ settings.election_status === 'open' ? 'PEMILIHAN DIBUKA' : 'PEMILIHAN DITUTUP' }}</span>
          </span>

          <!-- Public Live Count Button -->
          <router-link to="/hasil-suara" class="btn btn-sm btn-outline-light d-flex align-items-center gap-1">
            <i class="bi bi-bar-chart-line-fill"></i>
            <span class="d-none d-sm-inline">Live Count</span>
          </router-link>

          <!-- Student Active Session Badge -->
          <div v-if="studentSession" class="d-flex align-items-center bg-white text-dark rounded-pill px-2 py-1 shadow-sm">
            <i class="bi bi-person-circle text-primary fs-5 me-1"></i>
            <div class="me-2 text-start">
              <span class="d-block fw-bold fs-8 lh-1 text-truncate" style="max-width: 120px;">{{ studentSession.full_name }}</span>
              <span class="text-muted fs-8">{{ studentSession.class_name }}</span>
            </div>
            <button @click="logoutStudent" class="btn btn-outline-danger btn-sm rounded-circle p-1 lh-1" title="Keluar">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>

          <!-- Admin Active Session Badge -->
          <div v-else-if="adminSession" class="d-flex align-items-center bg-warning text-dark rounded-pill px-2 py-1 shadow-sm">
            <i class="bi bi-shield-lock-fill text-dark fs-5 me-1"></i>
            <span class="fw-bold fs-8 me-2">Admin eOSIS</span>
            <router-link to="/admin/dashboard" class="btn btn-dark btn-sm rounded-pill py-0 px-2 fs-8 me-1">
              Panel
            </router-link>
            <button @click="logoutAdmin" class="btn btn-outline-dark btn-sm rounded-circle p-1 lh-1" title="Keluar Admin">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>

          <!-- Admin Login link if not logged in -->
          <router-link v-else-if="!$route.path.startsWith('/admin')" to="/admin/login" class="btn btn-sm btn-outline-light text-nowrap">
            <i class="bi bi-shield-lock"></i>
            <span class="d-none d-md-inline ms-1">Masuk Admin</span>
          </router-link>

        </div>
      </div>
    </header>

    <!-- Main Content Body -->
    <main class="flex-grow-1">
      <router-view @refresh-settings="loadSchoolSettings" />
    </main>

    <!-- Global Footer -->
    <footer class="bg-white border-top py-3 text-center text-muted small mt-auto">
      <div class="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-check2-circle text-success fs-5"></i>
          <span><strong>eOSIS</strong> &bull; Sistem Pemilihan Berbasis Digital & Real-Time</span>
        </div>
        <div>
          <span>Tahun Ajaran {{ settings.academic_year || '2026/2027' }} &bull; {{ settings.school_name }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { dbService } from './supabase.js';

export default {
  name: 'App',
  data() {
    return {
      settings: {},
      studentSession: null,
      adminSession: null
    };
  },
  created() {
    this.loadSchoolSettings();
    this.checkSessions();
  },
  watch: {
    $route() {
      this.checkSessions();
    }
  },
  methods: {
    async loadSchoolSettings() {
      try {
        this.settings = await dbService.getSettings();
      } catch (err) {
        console.error('Gagal memuat pengaturan sekolah:', err);
      }
    },
    checkSessions() {
      const studentRaw = sessionStorage.getItem('eosis_student_session');
      this.studentSession = studentRaw ? JSON.parse(studentRaw) : null;

      const adminRaw = sessionStorage.getItem('eosis_admin_session');
      this.adminSession = adminRaw ? JSON.parse(adminRaw) : null;
    },
    logoutStudent() {
      sessionStorage.removeItem('eosis_student_session');
      this.studentSession = null;
      this.$router.push('/');
    },
    logoutAdmin() {
      sessionStorage.removeItem('eosis_admin_session');
      this.adminSession = null;
      this.$router.push('/admin/login');
    },
    onLogoError(e) {
      e.target.src = 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80';
    }
  }
};
</script>

<style>
.fs-8 {
  font-size: 0.78rem;
}
</style>
