<template>
  <div class="container-fluid px-0">
    <div class="row g-0">
      
      <!-- Admin Sidebar -->
      <aside class="col-md-3 col-lg-2 admin-sidebar p-3 d-none d-md-block">
        <div class="mb-4 px-2">
          <div class="small fw-bold text-muted text-uppercase tracking-wider">Navigasi Admin</div>
          <div class="text-primary fw-bold fs-6">Sistem eOSIS</div>
        </div>

        <nav class="nav flex-column">
          <router-link to="/admin/dashboard" class="admin-nav-link" active-class="active">
            <i class="bi bi-speedometer2 fs-5"></i>
            <span>Dashboard</span>
          </router-link>

          <router-link to="/admin/kandidat" class="admin-nav-link" active-class="active">
            <i class="bi bi-person-vcard fs-5"></i>
            <span>Manajemen Kandidat</span>
          </router-link>

          <router-link to="/admin/kelas" class="admin-nav-link" active-class="active">
            <i class="bi bi-building fs-5"></i>
            <span>Manajemen Kelas</span>
          </router-link>

          <router-link to="/admin/siswa" class="admin-nav-link" active-class="active">
            <i class="bi bi-people fs-5"></i>
            <span>Data Siswa / DPT</span>
          </router-link>

          <router-link to="/admin/perolehan-suara" class="admin-nav-link" active-class="active">
            <i class="bi bi-graph-up-arrow fs-5"></i>
            <span>Perolehan Suara</span>
          </router-link>

          <router-link to="/admin/pengaturan" class="admin-nav-link" active-class="active">
            <i class="bi bi-gear fs-5"></i>
            <span>Pengaturan Sekolah</span>
          </router-link>
        </nav>

        <hr class="my-4 text-muted" />

        <div class="px-2">
          <router-link to="/hasil-suara" target="_blank" class="btn btn-outline-primary btn-sm w-100 mb-2 rounded-3 text-start">
            <i class="bi bi-broadcast me-1"></i> Layar Publik (Proyektor)
          </router-link>

          <button @click="logout" class="btn btn-outline-danger btn-sm w-100 rounded-3 text-start">
            <i class="bi bi-box-arrow-left me-1"></i> Keluar Admin
          </button>
        </div>
      </aside>

      <!-- Mobile Top Navigation for Admin -->
      <div class="col-12 d-md-none bg-white border-bottom p-2 px-3 overflow-auto">
        <div class="d-flex gap-1 text-nowrap">
          <router-link to="/admin/dashboard" class="btn btn-sm btn-light" active-class="btn-primary text-white">Dashboard</router-link>
          <router-link to="/admin/kandidat" class="btn btn-sm btn-light" active-class="btn-primary text-white">Kandidat</router-link>
          <router-link to="/admin/kelas" class="btn btn-sm btn-light" active-class="btn-primary text-white">Kelas</router-link>
          <router-link to="/admin/siswa" class="btn btn-sm btn-light" active-class="btn-primary text-white">DPT Siswa</router-link>
          <router-link to="/admin/perolehan-suara" class="btn btn-sm btn-light" active-class="btn-primary text-white">Perolehan</router-link>
          <router-link to="/admin/pengaturan" class="btn btn-sm btn-light" active-class="btn-primary text-white">Pengaturan</router-link>
        </div>
      </div>

      <!-- Main Admin Content Area -->
      <section class="col-md-9 col-lg-10 p-4 p-md-4 bg-light min-vh-100">
        <router-view @refresh-settings="$emit('refresh-settings')" />
      </section>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  emits: ['refresh-settings'],
  methods: {
    logout() {
      sessionStorage.removeItem('eosis_admin_session');
      this.$router.push('/admin/login');
    }
  }
};
</script>
