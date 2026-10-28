import { createRouter, createWebHistory } from 'vue-router';

// Lazy-loaded or direct components
import LoginSiswa from '../views/LoginSiswa.vue';
import BilikSuara from '../views/BilikSuara.vue';
import VotingSukses from '../views/VotingSukses.vue';
import HasilSuaraPublic from '../views/HasilSuaraPublic.vue';

import LoginAdmin from '../views/admin/LoginAdmin.vue';
import AdminLayout from '../views/admin/AdminLayout.vue';
import DashboardAdmin from '../views/admin/DashboardAdmin.vue';
import ManajemenKandidat from '../views/admin/ManajemenKandidat.vue';
import ManajemenKelas from '../views/admin/ManajemenKelas.vue';
import ManajemenSiswa from '../views/admin/ManajemenSiswa.vue';
import PerolehanSuara from '../views/admin/PerolehanSuara.vue';
import PengaturanSekolah from '../views/admin/PengaturanSekolah.vue';

const routes = [
  {
    path: '/',
    name: 'LoginSiswa',
    component: LoginSiswa,
    meta: { title: 'Login Siswa - eOSIS' }
  },
  {
    path: '/bilik-suara',
    name: 'BilikSuara',
    component: BilikSuara,
    meta: { title: 'Bilik Suara - eOSIS', requiresStudentAuth: true }
  },
  {
    path: '/voting-sukses',
    name: 'VotingSukses',
    component: VotingSukses,
    meta: { title: 'Suara Berhasil Dicoblos - eOSIS' }
  },
  {
    path: '/hasil-suara',
    name: 'HasilSuaraPublic',
    component: HasilSuaraPublic,
    meta: { title: 'Live Count Perolehan Suara - eOSIS' }
  },
  {
    path: '/admin/login',
    name: 'LoginAdmin',
    component: LoginAdmin,
    meta: { title: 'Login Admin - eOSIS' }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdminAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'DashboardAdmin',
        component: DashboardAdmin,
        meta: { title: 'Dashboard Admin - eOSIS' }
      },
      {
        path: 'kandidat',
        name: 'ManajemenKandidat',
        component: ManajemenKandidat,
        meta: { title: 'Manajemen Paslon Kandidat - eOSIS' }
      },
      {
        path: 'kelas',
        name: 'ManajemenKelas',
        component: ManajemenKelas,
        meta: { title: 'Manajemen Kelas - eOSIS' }
      },
      {
        path: 'siswa',
        name: 'ManajemenSiswa',
        component: ManajemenSiswa,
        meta: { title: 'Manajemen Data Siswa (DPT) - eOSIS' }
      },
      {
        path: 'perolehan-suara',
        name: 'PerolehanSuaraAdmin',
        component: PerolehanSuara,
        meta: { title: 'Perolehan Suara Real-time - eOSIS' }
      },
      {
        path: 'pengaturan',
        name: 'PengaturanSekolah',
        component: PengaturanSekolah,
        meta: { title: 'Pengaturan Sekolah & Sistem - eOSIS' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }

  const isStudentLoggedIn = Boolean(sessionStorage.getItem('eosis_student_session'));
  const isAdminLoggedIn = Boolean(sessionStorage.getItem('eosis_admin_session'));

  // Route requiring student login
  if (to.meta.requiresStudentAuth && !isStudentLoggedIn) {
    return next({ path: '/' });
  }

  // Route requiring admin login
  if (to.matched.some(record => record.meta.requiresAdminAuth) && !isAdminLoggedIn) {
    return next({ path: '/admin/login' });
  }

  // If already logged in as student and visits root login, redirect to voting booth
  if (to.path === '/' && isStudentLoggedIn) {
    const student = JSON.parse(sessionStorage.getItem('eosis_student_session'));
    if (student.has_voted) {
      return next({ path: '/voting-sukses' });
    }
    return next({ path: '/bilik-suara' });
  }

  // If already logged in as admin and visits admin login
  if (to.path === '/admin/login' && isAdminLoggedIn) {
    return next({ path: '/admin/dashboard' });
  }

  next();
});

export default router;
