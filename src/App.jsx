import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const [visitorModal, setVisitorModal] = useState({ isOpen: false, activeTab: 'tugas' })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [tugas, setTugas] = useState([])
  const [ulangan, setUlangan] = useState([])
  const [kisi, setKisi] = useState([])
  const [jadwal, setJadwal] = useState([])
  const [gallery, setGallery] = useState([])

  async function loadTugas() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true })

    if (error) {
      console.error("Failed to load tugas, ", error)
      return
    }

    setTugas(data)
  }

  async function loadUlangan() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error("Failed to load ulangan, ", error)
      return
    }
  }

  async function loadKisi() {
    const { data, error } = await supabase
      .from('study_guides')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load kisi-kisi:', error)
      return
    }

    setKisi(data)
  }

  async function loadJadwal() {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to load jadwal:', error)
      return
    }

    setJadwal(data)
  }

  async function loadGallery() {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load gallery:', error)
      return
    }

    setGallery(data)
  }

  useEffect(() => {
    checkUser()

    loadTugas()
    loadUlangan()
    loadKisi()
    loadJadwal()
    loadGallery()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)

    if (!user) {
      setProfile(null)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('name, user_role')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  async function login(e) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    setShowLogin(false)
    setEmail('')
    setPassword('')
  }

  async function logout() {
    await supabase.auth.signOut()
    setShowDashboard(false)
  }

  const isPengurus = profile?.user_role === 'pengurus'

  const openVisitorModal = (tab) => {
    setVisitorModal({ isOpen: true, activeTab: tab })
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="/" className="text-xl font-bold tracking-tight">
            KelasXB<span className="text-black/40">.</span>
          </a>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isPengurus && (
                  <button
                    onClick={() => setShowDashboard(!showDashboard)}
                    className="hidden rounded-full border border-black px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white sm:block"
                  >
                    {showDashboard ? 'Beranda' : 'Dashboard'}
                  </button>
                )}

                <button
                  onClick={logout}
                  className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {showDashboard ? (
        <Dashboard onClose={() => setShowDashboard(false)} />
      ) : (
        <main>
          {/* HERO SECTION */}
          <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-black/50">
                SMA Negeri 1 Pandaan · X-B
              </p>

              <h1 className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
                Everything about
                <br />
                our class.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-black/60 sm:text-lg">
                Tempat untuk melihat tugas, ulangan, kisi-kisi,
                jadwal, dan dokumentasi kelas X-B.
              </p>

              {/* VISITOR ACTION BUTTONS */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openVisitorModal('tugas')}
                  className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80 shadow-sm"
                >
                  📝 Lihat Tugas
                </button>
                <button
                  onClick={() => openVisitorModal('ulangan')}
                  className="rounded-full border border-black/20 px-5 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                >
                  📅 Lihat Ulangan
                </button>
                <button
                  onClick={() => openVisitorModal('kisi')}
                  className="rounded-full border border-black/20 px-5 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                >
                  📌 Lihat Kisi-kisi
                </button>
                <button
                  onClick={() => openVisitorModal('gallery')}
                  className="rounded-full border border-black/20 px-5 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                >
                  🖼️ Lihat Gallery
                </button>
              </div>
            </div>
          </section>

          {/* FEATURE CARDS */}
          <section className="border-y border-black/10">
            <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Feature
                number="01"
                title="Tugas"
                description="Lihat tugas yang akan datang."
                onClick={() => openVisitorModal('tugas')}
              />

              <Feature
                number="02"
                title="Ulangan"
                description="Pantau jadwal ulangan kelas."
                onClick={() => openVisitorModal('ulangan')}
              />

              <Feature
                number="03"
                title="Kisi-kisi"
                description="Persiapan sebelum menghadapi ulangan."
                onClick={() => openVisitorModal('kisi')}
              />

              <Feature
                number="04"
                title="Gallery"
                description="Dokumentasi dan momen kelas."
                onClick={() => openVisitorModal('gallery')}
              />
            </div>
          </section>

          {/* INFO BANNER */}
          <section className="mx-auto max-w-6xl px-5 py-20">
            <div className="flex flex-col gap-4 rounded-3xl bg-black p-8 text-white sm:p-12">
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                Class X-B
              </p>

              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                One place. Everything we need.
              </h2>

              <p className="max-w-xl text-white/60">
                Informasi kelas yang rapi, sederhana, dan mudah
                diakses kapan saja.
              </p>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => openVisitorModal('tugas')}
                  className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition"
                >
                  Jelajahi Informasi Kelas
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* VISITOR MODAL VIEWER */}
      {visitorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-white p-6 shadow-2xl overflow-hidden">
            {/* Modal Header & Tabs */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Informasi Kelas X-B</h2>
                <p className="text-xs text-black/50">Pilih kategori untuk melihat informasi lengkap.</p>
              </div>
              <button
                onClick={() => setVisitorModal({ isOpen: false, activeTab: 'tugas' })}
                className="rounded-full bg-black/5 p-2 text-black/60 hover:bg-black hover:text-white transition text-sm w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex border-b border-black/10 overflow-x-auto py-3 gap-2">
              {[
                { id: 'tugas', label: '📝 Tugas' },
                { id: 'ulangan', label: '📅 Ulangan' },
                { id: 'kisi', label: '📌 Kisi-kisi' },
                { id: 'gallery', label: '🖼️ Gallery' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVisitorModal({ ...visitorModal, activeTab: tab.id })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                    visitorModal.activeTab === tab.id
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black/70 hover:bg-black/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
              {/* TUGAS VIEW */}
              {visitorModal.activeTab === 'tugas' && (
                <div className="space-y-3">
                  {tugas.map((t) => (
                    <div key={t.id} className="p-4 border border-black/10 rounded-2xl bg-neutral-50 hover:border-black/30 transition">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold bg-black/10 text-black/80 px-2.5 py-1 rounded-md">
                          {t.subject}
                        </span>
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          Tenggat: {t.deadline}
                        </span>
                      </div>
                      <h3 className="font-bold text-base mt-2">{t.title}</h3>
                      <p className="text-xs text-black/60 mt-1">{t.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ULANGAN VIEW */}
              {visitorModal.activeTab === 'ulangan' && (
                <div className="space-y-3">
                  {ulangan.map((u) => (
                    <div
                      key={u.id}
                      className="p-4 border border-black/10 rounded-2xl bg-neutral-50 hover:border-black/30 transition"
                    >
                      <span className="text-xs font-semibold bg-black/10 text-black/80 px-2.5 py-1 rounded-md">
                        {u.subject}
                      </span>

                      <h3 className="font-bold text-base mt-2">
                        {u.topic}
                      </h3>

                      <p className="text-xs text-black/50 mt-1">
                        Tanggal Pelaksanaan:{' '}
                        <span className="font-semibold text-black">
                          {u.date}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* KISI-KISI VIEW */}
              {visitorModal.activeTab === 'kisi' && (
                <div className="space-y-3">
                  {kisi.map((k) => (
                    <div key={k.id} className="p-4 border border-black/10 rounded-2xl bg-neutral-50 hover:border-black/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-base">{k.subject}</h3>
                        <p className="text-xs text-black/60 mt-1">{k.note}</p>
                        <p className="text-xs font-mono text-black/40 mt-1">📁 {k.file}</p>
                      </div>
                      <button
                        onClick={() => alert(`Mengunduh file: ${k.file}`)}
                        className="self-start sm:self-auto text-xs bg-black text-white px-3.5 py-2 rounded-xl font-medium hover:bg-black/80 transition"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* GALLERY VIEW */}
              {visitorModal.activeTab === 'gallery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((g) => (
                    <div
                      key={g.id}
                      className="border border-black/10 rounded-2xl overflow-hidden bg-neutral-50"
                    >
                      <img
                        src={g.url}
                        alt={g.title}
                        className="w-full h-36 object-cover"
                      />

                      <div className="p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-black/40">
                          {g.album}
                        </span>

                        <h4 className="font-semibold text-sm mt-0.5">
                          {g.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
          <form
            onSubmit={login}
            className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl"
          >
            <div className="mb-7">
              <h2 className="text-2xl font-semibold">Login</h2>
              <p className="mt-1 text-sm text-black/50">
                Masuk sebagai pengurus kelas.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-black"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-black"
                required
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Feature({ number, title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="border-b border-black/10 p-7 sm:border-r lg:border-b-0 cursor-pointer group hover:bg-black/5 transition"
    >
      <span className="text-xs font-medium text-black/40">
        {number}
      </span>

      <h3 className="mt-8 text-xl font-semibold flex items-center justify-between">
        {title}
        <span className="text-sm font-normal text-black/40 group-hover:text-black transition">Lihat →</span>
      </h3>

      <p className="mt-2 text-sm leading-6 text-black/50">
        {description}
      </p>
    </div>
  )
}

export default App