import { useEffect ,useState } from 'react';
import { supabase } from '../lib/supabase'

export default function Dashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadTugas();
    loadUlangan();
    loadKisi();
    loadJadwal();
    loadGallery();
  }, []);

  async function loadTugas() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });

      if (error) {
        console.error("Failed to fetch tugas!");
        return;
      }

      setTugasList(data)
  }

  async function loadUlangan() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Failed to fetch ulangan');
      return;
    }

    setUlanganList(data);
  }
  
  async function loadKisi() {
    const { data, error } = await supabase
      .from('study_guides')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Failed to fetch kisi-kisi');
      return;
    }

    setKisiList(data);
  }

  async function loadJadwal() {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch jadwal');
      return;
    }

    setJadwalList(data);
  }

  async function loadGallery() {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Failed to fetch gallery!");
      return;
    }

    setGalleryList(data);
  }

  const [tugasList, setTugasList] = useState([]);
  const [ulanganList, setUlanganList] = useState([]);
  const [kisiList, setKisiList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);

  const [profile, setProfile] = useState({
    nama: 'Pengurus X-B',
    jabatan: 'Ketua Kelas',
    kontak: 'pengurus@kelasxb.sch.id',
  });

  // Modal / Form States
  const [modalState, setModalState] = useState({ isOpen: false, type: '', data: null });
  const [formData, setFormData] = useState({});

  const openModal = (type, data = null) => {
    setModalState({ isOpen: true, type, data });
    setFormData(data || {});
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: '', data: null });
    setFormData({});
  };

  // CRUD Handlers
  const handleSaveTugas = async (e) => {
    e.preventDefault();

    if (modalState.data) {
      const { error } = await supabase
        .from('tasks')
        .update({
          subject: formData.subject,
          title: formData.title,
          description: formData.description || null,
          deadline: formData.deadline,
        })
        .eq('id', modalState.data.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('tasks')
        .insert({
          subject: formData.subject,
          title: formData.title,
          description: formData.description || null,
          deadline: formData.deadline,
          created_by: user?.id,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    await loadTugas();
    closeModal();
  };

  const handleDeleteTugas = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadTugas();
  };

  const handleSaveUlangan = async (e) => {
    e.preventDefault();

    if (modalState.data) {
      const { error } = await supabase
        .from('exams')
        .update({
          subject: formData.subject,
          topic: formData.topic,
          date: formData.date,
        })
        .eq('id', modalState.data.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('exams')
        .insert({
          subject: formData.subject,
          topic: formData.topic,
          date: formData.date,
          created_by: user?.id,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    await loadUlangan();
    closeModal();
  };

  const handleDeleteUlangan = async (id) => {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadUlangan();
  };

  const handleSaveKisi = async (e) => {
    e.preventDefault();

    if (modalState.data) {
      const { error } = await supabase
        .from('study_guides')
        .update({
          subject: formData.subject,
          file: formData.file,
          note: formData.note || null,
        })
        .eq('id', modalState.data.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('study_guides')
        .insert({
          subject: formData.subject,
          file: formData.file,
          note: formData.note || null,
          created_by: user?.id,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    await loadKisi();
    closeModal();
  };

  const handleDeleteKisi = async (id) => {
    const { error } = await supabase
      .from('study_guides')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadKisi();
  };

  const handleSaveJadwal = async (e) => {
    e.preventDefault();

    if (modalState.data) {
      const { error } = await supabase
        .from('schedule')
        .update({
          day: formData.day,
          subjects: formData.subjects,
        })
        .eq('id', modalState.data.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('schedule')
        .insert({
          day: formData.day,
          subjects: formData.subjects,
          created_by: user?.id,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    await loadJadwal();
    closeModal();
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();

    if (modalState.data) {
      const { error } = await supabase
        .from('gallery')
        .update({
          title: formData.title,
          album: formData.album,
          url: formData.url,
        })
        .eq('id', modalState.data.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('gallery')
        .insert({
          title: formData.title,
          album: formData.album,
          url: formData.url,
          created_by: user?.id,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    await loadGallery();
    closeModal();
  };

  const handleDeletePhoto = async (id) => {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadGallery();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...formData });
    alert('Profil pengurus berhasil diperbarui!');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tugas', label: 'Tugas', icon: '📝' },
    { id: 'ulangan', label: 'Ulangan', icon: '📅' },
    { id: 'kisi', label: 'Kisi-kisi', icon: '📌' },
    { id: 'jadwal', label: 'Jadwal', icon: '⏰' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-black/10 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight">Dashboard X-B</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-xs border border-black/20 px-2 py-1 rounded hover:bg-black hover:text-white transition"
              >
                Tutup
              </button>
            )}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition ${
                  activeTab === item.id
                    ? 'bg-black text-white'
                    : 'text-black/70 hover:bg-black/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-6 border-t border-black/10 text-xs text-black/50">
          Pengurus Dashboard v1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Overview</h1>
              <p className="text-black/60 text-sm mt-1">Ringkasan aktivitas dan status data kelas X-B.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-black/40">Total Tugas Aktif</span>
                <p className="text-3xl font-bold mt-2">{tugasList.length}</p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-black/40">Ulangan Terdekat</span>
                <p className="text-xl font-bold mt-2 truncate">
                  {ulanganList.length > 0 ? ulanganList[0].subject : 'Tidak Ada'}
                </p>
                {ulanganList.length > 0 && (
                  <p className="text-xs text-black/50 mt-1">{ulanganList[0].date}</p>
                )}
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-black/40">Kisi-Kisi Tersedia</span>
                <p className="text-3xl font-bold mt-2">{kisiList.length}</p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-black/40">Total Album Gallery</span>
                <p className="text-3xl font-bold mt-2">{galleryList.length}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-black/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setActiveTab('tugas'); openModal('addTugas'); }}
                  className="bg-black text-white px-4 py-2 text-sm rounded-xl font-medium hover:bg-black/80 transition"
                >
                  + Tambah Tugas
                </button>
                <button
                  onClick={() => { setActiveTab('ulangan'); openModal('addUlangan'); }}
                  className="border border-black px-4 py-2 text-sm rounded-xl font-medium hover:bg-black hover:text-white transition"
                >
                  + Tambah Ulangan
                </button>
                <button
                  onClick={() => { setActiveTab('kisi'); openModal('addKisi'); }}
                  className="border border-black px-4 py-2 text-sm rounded-xl font-medium hover:bg-black hover:text-white transition"
                >
                  + Tambah Kisi-Kisi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TUGAS TAB */}
        {activeTab === 'tugas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Kelola Tugas</h1>
                <p className="text-black/60 text-sm mt-1">Daftar tugas aktif dan penambahan tugas baru.</p>
              </div>
              <button
                onClick={() => openModal('addTugas')}
                className="bg-black text-white px-4 py-2 text-sm rounded-xl font-medium hover:bg-black/80 transition"
              >
                + Tambah Tugas
              </button>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/10 overflow-hidden">
              {tugasList.length === 0 ? (
                <div className="p-6 text-center text-black/40 text-sm">Belum ada tugas.</div>
              ) : (
                tugasList.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs bg-black/5 border border-black/10 px-2 py-1 rounded font-medium text-black/70">
                        {item.subject}
                      </span>
                      <h3 className="font-semibold text-lg mt-1">{item.title}</h3>
                      <p className="text-xs text-black/50">Tenggat: {item.deadline}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('editTugas', item)}
                        className="px-3 py-1 text-xs border border-black/20 rounded-lg hover:bg-black hover:text-white transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTugas(item.id)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ULANGAN TAB */}
        {activeTab === 'ulangan' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Jadwal Ulangan</h1>
                <p className="text-black/60 text-sm mt-1">Pantau dan kelola jadwal evaluasi kelas.</p>
              </div>
              <button
                onClick={() => openModal('addUlangan')}
                className="bg-black text-white px-4 py-2 text-sm rounded-xl font-medium hover:bg-black/80 transition"
              >
                + Tambah Ulangan
              </button>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/10 overflow-hidden">
              {ulanganList.length === 0 ? (
                <div className="p-6 text-center text-black/40 text-sm">Belum ada ulangan.</div>
              ) : (
                ulanganList.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs bg-black/5 border border-black/10 px-2 py-1 rounded font-medium text-black/70">
                        {item.subject}
                      </span>
                      <h3 className="font-semibold text-lg mt-1">{item.topic}</h3>
                      <p className="text-xs text-black/50">Tanggal: {item.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('editUlangan', item)}
                        className="px-3 py-1 text-xs border border-black/20 rounded-lg hover:bg-black hover:text-white transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUlangan(item.id)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* KISI-KISI TAB */}
        {activeTab === 'kisi' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Kisi-Kisi Ulangan</h1>
                <p className="text-black/60 text-sm mt-1">Materi dan berkas persiapan ulangan.</p>
              </div>
              <button
                onClick={() => openModal('addKisi')}
                className="bg-black text-white px-4 py-2 text-sm rounded-xl font-medium hover:bg-black/80 transition"
              >
                + Tambah Kisi-Kisi
              </button>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/10 overflow-hidden">
              {kisiList.length === 0 ? (
                <div className="p-6 text-center text-black/40 text-sm">Belum ada kisi-kisi.</div>
              ) : (
                kisiList.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.subject}</h3>
                      <p className="text-xs text-black/60 mt-1">File: {item.file}</p>
                      {item.note && <p className="text-xs text-black/40 mt-1">Catatan: {item.note}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('editKisi', item)}
                        className="px-3 py-1 text-xs border border-black/20 rounded-lg hover:bg-black hover:text-white transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteKisi(item.id)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* JADWAL TAB */}
        {activeTab === 'jadwal' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Jadwal Pelajaran</h1>
                <p className="text-black/60 text-sm mt-1">Atur dan perbarui mata pelajaran mingguan.</p>
              </div>
              <button
                onClick={() => openModal('addJadwal')}
                className="bg-black text-white px-4 py-2 text-sm rounded-xl font-medium hover:bg-black/80 transition"
              >
                + Tambah Hari
              </button>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/10 overflow-hidden">
              {jadwalList.map((item) => (
                <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-base text-black">{item.day}</span>
                    <p className="text-sm text-black/70 mt-1">{item.subjects}</p>
                  </div>
                  <button
                    onClick={() => openModal('editJadwal', item)}
                    className="px-3 py-1 text-xs border border-black/20 rounded-lg hover:bg-black hover:text-white transition self-start sm:self-auto"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Gallery Album</h1>
                <p className="text-black/60 text-sm mt-1">Dokumentasi dan arsip album foto kelas.</p>
              </div>
              <button
                onClick={() => openModal('uploadPhoto')}
                className="bg-black text-white px-4 py-2 text-sm rounded-xl font-medium hover:bg-black/80 transition"
              >
                + Upload Foto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {galleryList.map((item) => (
                <div key={item.id} className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
                  <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-base">{item.title}</h3>
                      <span className="text-xs text-black/50">{item.album}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(item.id)}
                      className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-black/60 text-sm mt-1">Pengaturan profile pengurus kelas.</p>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl p-6 max-w-xl">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Nama Pengurus</label>
                  <input
                    type="text"
                    defaultValue={profile.nama}
                    onChange={(e) => setFormData({ ...profile, nama: e.target.value })}
                    className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Jabatan</label>
                  <input
                    type="text"
                    defaultValue={profile.jabatan}
                    onChange={(e) => setFormData({ ...profile, jabatan: e.target.value })}
                    className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1">Kontak / Email</label>
                  <input
                    type="email"
                    defaultValue={profile.kontak}
                    onChange={(e) => setFormData({ ...profile, kontak: e.target.value })}
                    className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-black text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-black/80 transition"
                >
                  Simpan Perubahan
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* MODAL HANDLER */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-xl font-bold">
              {modalState.type.startsWith('add') ? 'Tambah' : modalState.type.startsWith('edit') ? 'Edit' : 'Upload'}
            </h3>

            {/* FORM FOR TUGAS */}
            {(modalState.type === 'addTugas' || modalState.type === 'editTugas') && (
              <form onSubmit={handleSaveTugas} className="space-y-3">
                <input
                  type="text"
                  placeholder="Mata Pelajaran"
                  defaultValue={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Judul Tugas"
                  defaultValue={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <textarea
                  placeholder="Deskripsi Tugas"
                  defaultValue={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  rows="3"
                />
                <input
                  type="date"
                  defaultValue={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-xs border rounded-xl">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs bg-black text-white rounded-xl">Simpan</button>
                </div>
              </form>
            )}

            {/* FORM FOR ULANGAN */}
            {(modalState.type === 'addUlangan' || modalState.type === 'editUlangan') && (
              <form onSubmit={handleSaveUlangan} className="space-y-3">
                <input
                  type="text"
                  placeholder="Mata Pelajaran"
                  defaultValue={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Materi / Topik"
                  defaultValue={formData.topic || ''}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="date"
                  defaultValue={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-xs border rounded-xl">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs bg-black text-white rounded-xl">Simpan</button>
                </div>
              </form>
            )}

            {/* FORM FOR KISI */}
            {(modalState.type === 'addKisi' || modalState.type === 'editKisi') && (
              <form onSubmit={handleSaveKisi} className="space-y-3">
                <input
                  type="text"
                  placeholder="Mata Pelajaran / Judul"
                  defaultValue={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Nama File / Link"
                  defaultValue={formData.file || ''}
                  onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Catatan Singkat"
                  defaultValue={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-xs border rounded-xl">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs bg-black text-white rounded-xl">Simpan</button>
                </div>
              </form>
            )}

            {/* FORM FOR JADWAL */}
            {(modalState.type === 'addJadwal' || modalState.type === 'editJadwal') && (
              <form onSubmit={handleSaveJadwal} className="space-y-3">
                <input
                  type="text"
                  placeholder="Hari (misal: Senin)"
                  defaultValue={formData.day || ''}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Daftar Mata Pelajaran"
                  defaultValue={formData.subjects || ''}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-xs border rounded-xl">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs bg-black text-white rounded-xl">Simpan</button>
                </div>
              </form>
            )}

            {/* FORM FOR GALLERY UPLOAD */}
            {modalState.type === 'uploadPhoto' && (
              <form onSubmit={handleUploadPhoto} className="space-y-3">
                <input
                  type="text"
                  placeholder="Judul Foto"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Nama Album"
                  onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                  required
                />
                <input
                  type="url"
                  placeholder="URL Foto (Gambar)"
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-xs border rounded-xl">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs bg-black text-white rounded-xl">Upload</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
