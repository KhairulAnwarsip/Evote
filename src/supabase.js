import { createClient } from '@supabase/supabase-js';

// Default / fallback credentials or read from Vite environment variables / localStorage
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const savedConfig = (() => {
  try {
    const raw = localStorage.getItem('eosis_supabase_config');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
})();

export const supabaseUrl = savedConfig?.url || envUrl || 'https://sample-project-id.supabase.co';
export const supabaseAnonKey = savedConfig?.anonKey || envKey || 'sample-anon-key';

export const isConfigured = Boolean(
  (savedConfig?.url || envUrl) && 
  (savedConfig?.anonKey || envKey) && 
  !supabaseUrl.includes('sample-project-id')
);

// Inisialisasi Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Default Mock/Initial Seed Data for standalone demo & fallback
const DEFAULT_SCHOOL_SETTINGS = {
  school_name: 'SMP NEGERI 1 NUSANTARA',
  school_slogan: 'Berakhlak Mulia, Cerdas, dan Berprestasi (Fase D)',
  academic_year: '2026/2027',
  election_title: 'Pemilihan Ketua & Wakil Ketua OSIS Periode 2026/2027',
  election_date: '2026-10-27',
  election_status: 'open', // 'open' | 'closed'
  admin_pin: '123456',
  school_logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80',
  storage_bucket: 'eosis-media'
};

const DEFAULT_CLASSES = [
  { id: 'cls-1', name: 'VII-A', level: 'Fase D' },
  { id: 'cls-2', name: 'VII-B', level: 'Fase D' },
  { id: 'cls-3', name: 'VIII-A', level: 'Fase D' },
  { id: 'cls-4', name: 'VIII-B', level: 'Fase D' },
  { id: 'cls-5', name: 'IX-A', level: 'Fase D' },
  { id: 'cls-6', name: 'IX-B', level: 'Fase D' }
];

const DEFAULT_CANDIDATES = [
  {
    id: 'cand-1',
    paslon_number: 1,
    leader_name: 'Muhammad Farhan Pratama',
    co_leader_name: 'Aisyah Putri Rahma',
    class_leader: 'VIII-A',
    class_co_leader: 'VII-A',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    color_theme: '#0d6efd',
    vision: 'Mewujudkan OSIS SMP yang aktif, berakhlak mulia, cerdas dalam IPTEK, dan peduli lingkungan.',
    mission: `1. Memfasilitasi bakat seni, olahraga, dan akademik seluruh siswa secara inklusif.
2. Mengoptimalkan mading dan media digital sekolah untuk transparansi kegiatan siswa.
3. Menjalin kolaborasi aktif antar ekstrakurikuler dalam penyelenggaraan pentas kreasi tahunan.
4. Menerapkan gerakan 'Green School' bebas sampah plastik di lingkungan sekolah.`,
    programs: 'Pentas Seni Budaya Pelajar, Mentoring Belajar Sebaya, Turnamen Futsal & E-Sport SMP, Gerakan Sekolah Peduli Lingkungan'
  },
  {
    id: 'cand-2',
    paslon_number: 2,
    leader_name: 'Bintang Arya Pratama',
    co_leader_name: 'Dewi Sekar Ayu',
    class_leader: 'VIII-B',
    class_co_leader: 'VIII-A',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    color_theme: '#198754',
    vision: 'Menjadi wadah aspirasi siswa yang inovatif, mandiri, berkarakter Profil Pelajar Pancasila.',
    mission: `1. Meningkatkan kedisiplinan dan rasa kepedulian sosial melalui bakti masyarakat rutin.
2. Mengembangkan kompetensi kepemimpinan pemuda dengan latihan dasar kepemimpinan (LDK).
3. Menciptakan forum 'Suara Siswa' sebagai jembatan komunikasi sehat dengan guru dan pembina.
4. Mendukung prestasi non-akademik di tingkat kabupaten dan provinsi.`,
    programs: 'LDK Siswa Ceria, Kotak Suara Aspirasi Siswa, Bakti Sosial Ramadhan & Hari Besar, Pekan Literasi & Debat Pelajar'
  },
  {
    id: 'cand-3',
    paslon_number: 3,
    leader_name: 'Arya Satria Nugraha',
    co_leader_name: 'Nabila Zahra Syahrani',
    class_leader: 'VIII-A',
    class_co_leader: 'VII-B',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    color_theme: '#6f42c1',
    vision: 'Membangun ekosistem sekolah yang kolaboratif, harmonis, adaptif terhadap era digital, dan ramah anak.',
    mission: `1. Mengembangkan media kreatif OSIS (Podcast, Fotografi) untuk mempromosikan prestasi siswa.
2. Menghidupkan kegiatan ekstrakurikuler robotik, sains club, dan pramuka penggalang.
3. Mengadakan pekan olahraga dan seni antarkelas (Class Meeting) yang menyenangkan.
4. Menegakkan gerakan anti-bullying dan saling menghargai di lingkungan sekolah.`,
    programs: 'Podcast eOSIS SMP, Kampanye Sahabat Siswa Anti-Bullying, Tournament Edu-Games, Pentas Minat & Bakat'
  }
];

const DEFAULT_STUDENTS = [
  { id: 'std-1', nisn: '0078901234', full_name: 'Ahmad Rizki Maulana', birth_date: '2011-05-14', class_name: 'VII-A', gender: 'L', has_voted: false, voted_at: null },
  { id: 'std-2', nisn: '0078901235', full_name: 'Siti Nurhaliza', birth_date: '2011-08-20', class_name: 'VII-A', gender: 'P', has_voted: true, voted_at: '2026-10-27T08:15:00Z', candidate_id: 'cand-1' },
  { id: 'std-3', nisn: '0078901236', full_name: 'Dimas Bagas Pratama', birth_date: '2010-01-11', class_name: 'VIII-A', gender: 'L', has_voted: true, voted_at: '2026-10-27T08:22:10Z', candidate_id: 'cand-2' },
  { id: 'std-4', nisn: '0078901237', full_name: 'Rania Alifah Putri', birth_date: '2010-12-04', class_name: 'VIII-A', gender: 'P', has_voted: false, voted_at: null },
  { id: 'std-5', nisn: '0078901238', full_name: 'Fikri Aditya', birth_date: '2010-09-19', class_name: 'VIII-B', gender: 'L', has_voted: true, voted_at: '2026-10-27T08:35:45Z', candidate_id: 'cand-1' },
  { id: 'std-6', nisn: '0078901239', full_name: 'Salma Zahirah', birth_date: '2009-11-28', class_name: 'IX-A', gender: 'P', has_voted: true, voted_at: '2026-10-27T08:40:12Z', candidate_id: 'cand-3' },
  { id: 'std-7', nisn: '0078901240', full_name: 'Gilang Ramadhan', birth_date: '2009-04-16', class_name: 'IX-B', gender: 'L', has_voted: false, voted_at: null },
  { id: 'std-8', nisn: '1234567890', full_name: 'Siswa Percobaan (Demo NISN)', birth_date: '2010-01-01', class_name: 'VIII-A', gender: 'L', has_voted: false, voted_at: null }
];

const DEFAULT_VOTES = [
  { id: 'vt-1', student_id: 'std-2', candidate_id: 'cand-1', voted_at: '2026-10-27T08:15:00Z', student_class: 'VII-A' },
  { id: 'vt-2', student_id: 'std-3', candidate_id: 'cand-2', voted_at: '2026-10-27T08:22:10Z', student_class: 'VIII-A' },
  { id: 'vt-3', student_id: 'std-5', candidate_id: 'cand-1', voted_at: '2026-10-27T08:35:45Z', student_class: 'VIII-B' },
  { id: 'vt-4', student_id: 'std-6', candidate_id: 'cand-3', voted_at: '2026-10-27T08:40:12Z', student_class: 'IX-A' }
];

// Local Storage helpers for robust offline/demo capability
function loadLocal(key, defaultVal) {
  try {
    const val = localStorage.getItem(`eosis_${key}`);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveLocal(key, val) {
  try {
    localStorage.setItem(`eosis_${key}`, JSON.stringify(val));
  } catch (err) {
    console.error(`Failed to save eosis_${key} to local storage`, err);
  }
}

// Initialise local storage if empty
if (!localStorage.getItem('eosis_settings')) saveLocal('settings', DEFAULT_SCHOOL_SETTINGS);
if (!localStorage.getItem('eosis_classes')) saveLocal('classes', DEFAULT_CLASSES);
if (!localStorage.getItem('eosis_candidates')) saveLocal('candidates', DEFAULT_CANDIDATES);
if (!localStorage.getItem('eosis_students')) saveLocal('students', DEFAULT_STUDENTS);
if (!localStorage.getItem('eosis_votes')) saveLocal('votes', DEFAULT_VOTES);

/**
 * Storage Upload Function to Supabase Storage Bucket
 * Automatically falls back to base64 Data URL if Supabase bucket isn't reachable or in Demo Mode
 */
export async function uploadFileToSupabase(file, bucketName = 'eosis-media', folder = 'uploads') {
  if (!file) throw new Error('File tidak valid');

  // If Supabase is configured, try uploading directly to bucket
  if (isConfigured) {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('Supabase Storage upload warning:', error.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            storageType: 'supabase',
            path: data.path
          };
        }
      }
    } catch (err) {
      console.warn('Fallback to local storage due to Supabase error:', err);
    }
  }

  // Graceful fallback to FileReader Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        url: e.target.result,
        storageType: 'local_base64',
        name: file.name
      });
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Data Management API Layer:
 * Seamlessly talks to Supabase if configured, with comprehensive error handling & local storage synchronization.
 */
export const dbService = {
  // Test Supabase Connection & Table Availability
  async testSupabaseConnection() {
    if (!isConfigured) {
      return {
        configured: false,
        message: 'Kredensial Supabase belum diatur. Menggunakan penyimpanan lokal browser.'
      };
    }

    try {
      // Test read across all application tables
      const results = await Promise.all([
        supabase.from('settings').select('id').limit(1),
        supabase.from('classes').select('id').limit(1),
        supabase.from('candidates').select('id').limit(1),
        supabase.from('students').select('id').limit(1),
        supabase.from('votes').select('id').limit(1)
      ]);

      const tableNames = ['settings', 'classes', 'candidates', 'students', 'votes'];
      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (res.error) {
          return {
            configured: true,
            success: false,
            error: res.error,
            message: `Gagal mengakses tabel '${tableNames[i]}': ${res.error.message} (Kode: ${res.error.code}). Silakan salin & jalankan Skrip SQL di menu Pengaturan Sekolah pada SQL Editor Supabase!`
          };
        }
      }

      return {
        configured: true,
        success: true,
        message: 'Koneksi ke Supabase berhasil! Seluruh tabel (settings, classes, candidates, students, votes) dan hak akses RLS aktif.'
      };
    } catch (err) {
      return {
        configured: true,
        success: false,
        message: 'Tidak dapat menghubungi server Supabase: ' + (err.message || 'Network error')
      };
    }
  },

  // Seed default data into Supabase
  async seedSupabaseDatabase() {
    if (!isConfigured) {
      throw new Error('Supabase belum dikonfigurasi.');
    }

    // 1. Settings
    await supabase.from('settings').upsert({ id: 1, ...DEFAULT_SCHOOL_SETTINGS });

    // 2. Classes
    for (const c of DEFAULT_CLASSES) {
      await supabase.from('classes').upsert(c);
    }

    // 3. Candidates
    for (const cand of DEFAULT_CANDIDATES) {
      await supabase.from('candidates').upsert(cand);
    }

    // 4. Students
    for (const s of DEFAULT_STUDENTS) {
      await supabase.from('students').upsert(s);
    }

    return true;
  },

  // Settings
  async getSettings() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (!error && data) {
          saveLocal('settings', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase settings query error, using local fallback:', err);
      }
    }
    return loadLocal('settings', DEFAULT_SCHOOL_SETTINGS);
  },

  async updateSettings(newSettings) {
    const payload = {
      school_name: String(newSettings.school_name || '').trim(),
      school_slogan: String(newSettings.school_slogan || '').trim(),
      academic_year: String(newSettings.academic_year || '').trim(),
      election_title: String(newSettings.election_title || '').trim(),
      election_date: newSettings.election_date || null,
      election_status: newSettings.election_status || 'open',
      admin_pin: String(newSettings.admin_pin || '123456').trim(),
      school_logo: newSettings.school_logo || ''
    };

    saveLocal('settings', { ...newSettings, ...payload });

    if (isConfigured) {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...payload });
      if (error) {
        console.error('Supabase updateSettings error:', error);
        throw new Error(`Gagal menyimpan pengaturan ke Supabase: ${error.message}`);
      }
    }
    return newSettings;
  },

  // Candidates
  async getCandidates() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('paslon_number', { ascending: true });

        if (!error && Array.isArray(data)) {
          if (data.length > 0) {
            saveLocal('candidates', data);
            return data;
          }
          // If Supabase returned empty table, return empty array so user sees true remote state
          saveLocal('candidates', []);
          return [];
        } else if (error) {
          console.warn('Supabase getCandidates error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase candidates query error, using local:', err);
      }
    }
    const candidates = loadLocal('candidates', DEFAULT_CANDIDATES);
    return candidates.sort((a, b) => a.paslon_number - b.paslon_number);
  },

  async saveCandidate(candidate) {
    // Format and sanitize candidate payload
    const payload = {
      id: candidate.id || `cand-${Date.now()}`,
      paslon_number: parseInt(candidate.paslon_number, 10) || 1,
      leader_name: String(candidate.leader_name || '').trim(),
      co_leader_name: String(candidate.co_leader_name || '').trim(),
      class_leader: String(candidate.class_leader || '').trim(),
      class_co_leader: String(candidate.class_co_leader || '').trim(),
      photo_url: String(candidate.photo_url || '').trim(),
      color_theme: String(candidate.color_theme || '#0d6efd').trim(),
      vision: String(candidate.vision || '').trim(),
      mission: String(candidate.mission || '').trim(),
      programs: String(candidate.programs || '').trim()
    };

    // Save to Supabase first if configured
    if (isConfigured) {
      const { data, error } = await supabase
        .from('candidates')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Supabase candidate save error:', error);
        let detailMsg = error.message;
        if (error.code === '42501' || (error.message && error.message.toLowerCase().includes('row-level security'))) {
          detailMsg = 'Tabel "candidates" di Supabase memblokir penyimpanan karena Row-Level Security (RLS) aktif tanpa izin insert. Silakan jalankan: ALTER TABLE candidates DISABLE ROW LEVEL SECURITY; di SQL Editor Supabase.';
        } else if (error.code === '23505') {
          detailMsg = `Nomor urut ${payload.paslon_number} sudah digunakan oleh paslon lain. Silakan pilih nomor urut yang berbeda.`;
        } else if (error.code === '42P01') {
          detailMsg = 'Tabel "candidates" belum dibuat di database Supabase Anda. Silakan salin & jalankan Skrip SQL di menu Pengaturan Sekolah.';
        }
        throw new Error(`Gagal menyimpan ke database Supabase: ${detailMsg}`);
      }
    }

    // Update local cache
    let candidates = loadLocal('candidates', DEFAULT_CANDIDATES);
    const existingIdx = candidates.findIndex(c => c.id === payload.id);
    if (existingIdx !== -1) {
      candidates[existingIdx] = payload;
    } else {
      candidates.push(payload);
    }
    candidates.sort((a, b) => a.paslon_number - b.paslon_number);
    saveLocal('candidates', candidates);

    return payload;
  },

  async deleteCandidate(id) {
    if (isConfigured) {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) {
        console.error('Supabase candidate delete error:', error);
        throw new Error(`Gagal menghapus paslon dari Supabase: ${error.message}`);
      }
    }

    let candidates = loadLocal('candidates', DEFAULT_CANDIDATES);
    candidates = candidates.filter(c => c.id !== id);
    saveLocal('candidates', candidates);
    return true;
  },

  // Classes
  async getClasses() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('classes').select('*').order('name', { ascending: true });
        if (!error && Array.isArray(data)) {
          if (data.length > 0) {
            saveLocal('classes', data);
            return data;
          }
          saveLocal('classes', []);
          return [];
        }
      } catch (err) {
        console.warn('Supabase classes query error, using local:', err);
      }
    }
    return loadLocal('classes', DEFAULT_CLASSES);
  },

  async saveClass(cls) {
    const payload = {
      id: cls.id || `cls-${Date.now()}`,
      name: String(cls.name || '').trim(),
      level: String(cls.level || 'Fase D').trim()
    };

    if (isConfigured) {
      const { error } = await supabase.from('classes').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.error('Supabase saveClass error:', error);
        let detailMsg = error.message;
        if (error.code === '42501' || (error.message && error.message.toLowerCase().includes('row-level security'))) {
          detailMsg = 'Tabel "classes" di Supabase memblokir penyimpanan karena Row-Level Security (RLS) aktif tanpa izin insert. Silakan jalankan: ALTER TABLE classes DISABLE ROW LEVEL SECURITY; di SQL Editor Supabase.';
        } else if (error.code === '23505') {
          detailMsg = `Nama kelas "${payload.name}" sudah ada di database. Silakan gunakan nama kelas yang berbeda.`;
        } else if (error.code === '42P01') {
          detailMsg = 'Tabel "classes" belum dibuat di database Supabase Anda. Silakan salin & jalankan Skrip SQL di menu Pengaturan Sekolah.';
        }
        throw new Error(`Gagal menyimpan kelas ke Supabase: ${detailMsg}`);
      }
    }

    let classes = loadLocal('classes', DEFAULT_CLASSES);
    const idx = classes.findIndex(c => c.id === payload.id);
    if (idx !== -1) classes[idx] = payload;
    else classes.push(payload);
    saveLocal('classes', classes);

    return payload;
  },

  async deleteClass(id) {
    if (isConfigured) {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteClass error:', error);
        let detailMsg = error.message;
        if (error.code === '42501' || (error.message && error.message.toLowerCase().includes('row-level security'))) {
          detailMsg = 'Akses ditolak oleh RLS. Jalankan "ALTER TABLE classes DISABLE ROW LEVEL SECURITY;" di SQL Editor Supabase.';
        }
        throw new Error(`Gagal menghapus kelas dari Supabase: ${detailMsg}`);
      }
    }

    let classes = loadLocal('classes', DEFAULT_CLASSES);
    classes = classes.filter(c => c.id !== id);
    saveLocal('classes', classes);
    return true;
  },

  // Students (DPT)
  async getStudents() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('students').select('*').order('full_name', { ascending: true });
        if (!error && Array.isArray(data)) {
          if (data.length > 0) {
            saveLocal('students', data);
            return data;
          }
          saveLocal('students', []);
          return [];
        }
      } catch (err) {
        console.warn('Supabase students query error, using local:', err);
      }
    }
    return loadLocal('students', DEFAULT_STUDENTS);
  },

  async saveStudent(student) {
    let cleanBirthDate = String(student.birth_date || '').trim();
    if (!cleanBirthDate || !/^\d{4}-\d{2}-\d{2}$/.test(cleanBirthDate)) {
      cleanBirthDate = '2010-01-01';
    }

    const payload = {
      id: student.id || `std-${Date.now()}`,
      nisn: String(student.nisn || '').trim(),
      full_name: String(student.full_name || '').trim(),
      class_name: String(student.class_name || '').trim(),
      gender: student.gender === 'P' ? 'P' : 'L',
      birth_date: cleanBirthDate,
      has_voted: Boolean(student.has_voted),
      voted_at: student.has_voted ? (student.voted_at || new Date().toISOString()) : null
    };

    if (!payload.nisn) {
      throw new Error('Nomor NISN siswa wajib diisi.');
    }
    if (!payload.full_name) {
      throw new Error('Nama lengkap siswa wajib diisi.');
    }
    if (!payload.class_name) {
      throw new Error('Kelas siswa wajib dipilih. Buat kelas terlebih dahulu jika belum tersedia.');
    }

    if (isConfigured) {
      const { error } = await supabase.from('students').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.error('Supabase saveStudent error:', error);
        let detailMsg = error.message;
        if (error.code === '42501' || (error.message && error.message.toLowerCase().includes('row-level security'))) {
          detailMsg = 'Tabel "students" di Supabase memblokir penyimpanan karena Row-Level Security (RLS) aktif tanpa izin insert. Silakan jalankan: ALTER TABLE students DISABLE ROW LEVEL SECURITY; di SQL Editor Supabase.';
        } else if (error.code === '23505') {
          detailMsg = `NISN "${payload.nisn}" sudah terdaftar pada pemilih lain di database. Silakan periksa kembali nomor NISN.`;
        } else if (error.code === '42P01') {
          detailMsg = 'Tabel "students" belum dibuat di database Supabase Anda. Silakan salin & jalankan Skrip SQL di menu Pengaturan Sekolah.';
        }
        throw new Error(`Gagal menyimpan siswa ke Supabase: ${detailMsg}`);
      }
    }

    let students = loadLocal('students', DEFAULT_STUDENTS);
    const idx = students.findIndex(s => s.id === payload.id);
    if (idx !== -1) students[idx] = payload;
    else students.push(payload);
    saveLocal('students', students);

    return payload;
  },

  async deleteStudent(id) {
    if (isConfigured) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteStudent error:', error);
        throw new Error(`Gagal menghapus siswa dari Supabase: ${error.message}`);
      }
    }

    let students = loadLocal('students', DEFAULT_STUDENTS);
    students = students.filter(s => s.id !== id);
    saveLocal('students', students);
    return true;
  },

  async resetStudentVote(studentId) {
    if (isConfigured) {
      const { error: stdErr } = await supabase.from('students').update({ has_voted: false, voted_at: null }).eq('id', studentId);
      const { error: vtErr } = await supabase.from('votes').delete().eq('student_id', studentId);
      if (stdErr || vtErr) {
        console.error('Supabase resetStudentVote error:', stdErr || vtErr);
        throw new Error(`Gagal mereset suara siswa di Supabase: ${(stdErr || vtErr).message}`);
      }
    }

    let students = loadLocal('students', DEFAULT_STUDENTS);
    let votes = loadLocal('votes', DEFAULT_VOTES);

    students = students.map(s => {
      if (s.id === studentId) {
        return { ...s, has_voted: false, voted_at: null, candidate_id: null };
      }
      return s;
    });

    votes = votes.filter(v => v.student_id !== studentId);

    saveLocal('students', students);
    saveLocal('votes', votes);

    return true;
  },

  // Student Authentication via NISN and Birth Date (YYYY-MM-DD)
  async authenticateStudent(nisn, birthDate) {
    const cleanNisn = String(nisn || '').trim();
    const cleanBirth = String(birthDate || '').trim();

    // 1. Check local storage / default students first (always reliable for demo/offline/sync)
    const students = loadLocal('students', DEFAULT_STUDENTS);
    const foundLocal = students.find(
      s => String(s.nisn).trim() === cleanNisn && String(s.birth_date || '').trim().startsWith(cleanBirth)
    );
    if (foundLocal) {
      return foundLocal;
    }

    // 2. If Supabase is configured, query remote table
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('nisn', cleanNisn)
          .maybeSingle();

        if (!error && data) {
          // Verify birth date matches prefix or exact
          const remoteBirth = String(data.birth_date || '').trim();
          if (remoteBirth === cleanBirth || remoteBirth.startsWith(cleanBirth) || cleanBirth.startsWith(remoteBirth)) {
            return data;
          }
        }
      } catch (err) {
        console.warn('Supabase auth student error:', err);
      }
    }

    return null;
  },

  // Record Vote
  async recordVote({ studentId, candidateId, studentClass }) {
    const timestamp = new Date().toISOString();
    const voteRecord = {
      id: `vt-${Date.now()}`,
      student_id: studentId,
      candidate_id: candidateId,
      student_class: studentClass,
      voted_at: timestamp
    };

    if (isConfigured) {
      const { error: vtErr } = await supabase.from('votes').insert(voteRecord);
      if (vtErr) {
        console.error('Supabase recordVote error:', vtErr);
        throw new Error(`Gagal merekam suara ke Supabase: ${vtErr.message}`);
      }

      const { error: stdErr } = await supabase.from('students').update({
        has_voted: true,
        voted_at: timestamp
      }).eq('id', studentId);

      if (stdErr) {
        console.warn('Supabase student vote status update error:', stdErr);
      }
    }

    // Update student voted status in local
    let students = loadLocal('students', DEFAULT_STUDENTS);
    students = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          has_voted: true,
          voted_at: timestamp,
          candidate_id: candidateId
        };
      }
      return s;
    });
    saveLocal('students', students);

    // Save vote record
    let votes = loadLocal('votes', DEFAULT_VOTES);
    votes.push(voteRecord);
    saveLocal('votes', votes);

    return voteRecord;
  },

  // Fetch Votes and Aggregates for Chart.js
  async getVoteStatistics() {
    let votes = [];
    let candidates = [];
    let students = [];

    if (isConfigured) {
      try {
        const [votesRes, candRes, stdRes] = await Promise.all([
          supabase.from('votes').select('*'),
          supabase.from('candidates').select('*').order('paslon_number', { ascending: true }),
          supabase.from('students').select('*')
        ]);
        if (candRes.data && Array.isArray(candRes.data)) candidates = candRes.data;
        if (votesRes.data && Array.isArray(votesRes.data)) votes = votesRes.data;
        if (stdRes.data && Array.isArray(stdRes.data)) students = stdRes.data;
      } catch (err) {
        console.warn('Supabase stats error, falling back to local storage:', err);
      }
    }

    if (candidates.length === 0) candidates = loadLocal('candidates', DEFAULT_CANDIDATES);
    if (students.length === 0) students = loadLocal('students', DEFAULT_STUDENTS);
    if (votes.length === 0) votes = loadLocal('votes', DEFAULT_VOTES);

    const totalDPT = students.length;
    const totalVotes = votes.length;
    const notVoted = Math.max(0, totalDPT - totalVotes);
    const participationRate = totalDPT > 0 ? ((totalVotes / totalDPT) * 100).toFixed(1) : '0.0';

    // Per candidate tallies
    const candidateStats = candidates.map(cand => {
      const voteCount = votes.filter(v => v.candidate_id === cand.id).length;
      const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : '0.0';
      return {
        ...cand,
        votes: voteCount,
        percentage: Number(percentage)
      };
    });

    // Breakdown per class
    const classBreakdown = {};
    votes.forEach(v => {
      const cls = v.student_class || 'Lainnya';
      classBreakdown[cls] = (classBreakdown[cls] || 0) + 1;
    });

    return {
      totalDPT,
      totalVotes,
      notVoted,
      participationRate,
      candidateStats,
      classBreakdown,
      lastUpdated: new Date().toLocaleTimeString('id-ID')
    };
  },

  // Reset All Votes
  async resetAllVotes() {
    if (isConfigured) {
      const { error: vtErr } = await supabase.from('votes').delete().neq('id', '0');
      const { error: stdErr } = await supabase.from('students').update({ has_voted: false, voted_at: null }).neq('id', '0');
      if (vtErr || stdErr) {
        console.error('Supabase resetAllVotes error:', vtErr || stdErr);
        throw new Error(`Gagal mengosongkan suara di Supabase: ${(vtErr || stdErr).message}`);
      }
    }

    saveLocal('votes', []);
    let students = loadLocal('students', DEFAULT_STUDENTS);
    students = students.map(s => ({ ...s, has_voted: false, voted_at: null, candidate_id: null }));
    saveLocal('students', students);

    return true;
  },

  // Reset to Demo Data
  resetToFactoryDefaults() {
    saveLocal('settings', DEFAULT_SCHOOL_SETTINGS);
    saveLocal('classes', DEFAULT_CLASSES);
    saveLocal('candidates', DEFAULT_CANDIDATES);
    saveLocal('students', DEFAULT_STUDENTS);
    saveLocal('votes', DEFAULT_VOTES);
  }
};
