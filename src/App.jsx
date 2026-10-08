import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard.jsx'

// Components
import SplitText from './components/SplitText.jsx'
import FlexCarousel from './components/FlexCarousel.jsx'
import FlipCard from './components/FlipCard.jsx'
import Stepper, { Step } from './components/Stepper.jsx'

// New Interactive Widgets & Audio
import RandomPickerWheel from './components/RandomPickerWheel.jsx'
import ExamCountdown from './components/ExamCountdown.jsx'
import { soundEngine } from './lib/audio'
import { fireConfetti } from './lib/confetti'

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

  // Forms
  const [form, setForm] = useState({
    target: '',
    name: '',
    message: '',
    important: false,
  })

  // Interactive state
  const [soundOn, setSoundOn] = useState(soundEngine.isEnabled())
  const [easterEggActive, setEasterEggActive] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)

  async function loadTugas() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true })

    if (error) {
      console.error("Failed to load tugas, ", error)
      return
    }

    setTugas(data || [])
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
    setUlangan(data || [])
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

    setKisi(data || [])
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

    setJadwal(data || [])
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

    setGallery(data || [])
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
    soundEngine.playPop()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    soundEngine.playChime()
    fireConfetti({ count: 35 })
    setShowLogin(false)
    setEmail('')
    setPassword('')
  }

  async function logout() {
    soundEngine.playPop()
    await supabase.auth.signOut()
    setShowDashboard(false)
  }

  const toggleSound = () => {
    const enabled = soundEngine.toggle()
    setSoundOn(enabled)
  }

  const handleLogoClick = (e) => {
    soundEngine.playPop()
    const nextCount = logoClicks + 1
    setLogoClicks(nextCount)

    if (nextCount >= 5) {
      soundEngine.playFanfare()
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      fireConfetti({ count: 60, x, y })
      setEasterEggActive(true)
      setLogoClicks(0)
    }
  }

  const isPengurus = profile?.user_role === 'pengurus'

  const openVisitorModal = (tab, e) => {
    soundEngine.playPop()
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      fireConfetti({ count: 25, x, y })
    }
    setVisitorModal({ isOpen: true, activeTab: tab })
  }

  // For Carousel - dynamically import asset images for Vite bundler safety
  const items = Array.from({ length: 28 }, (_, i) => ({
    src: new URL(`./assets/Pic/${i + 1}.jpg`, import.meta.url).href,
    alt: `Momen X-B ${i + 1}`,
    title: i === 0 ? 'Gema Pemilu' : i === 4 ? 'Keke & Riksi' : `Momen ${i + 1}`,
  }))

  const logoImg = new URL('./assets/Pic/logo.jpg', import.meta.url).href

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased selection:bg-black selection:text-white pb-16 sm:pb-0">
      {/* EASTER EGG BANNER */}
      {easterEggActive && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-black px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center justify-between gap-2 shadow-md">
          <button
            onClick={() => setEasterEggActive(false)}
            className="bg-black/20 hover:bg-black/40 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="border-b border-black/10 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <button
            onClick={handleLogoClick}
            className="text-xl font-bold tracking-tight active:scale-95 transition-transform touch-manipulation text-left group"
            title="Tap 5x untuk Kejutan Easter Egg!"
          >
            Kelas XB<span className="text-blue-600 transition-colors group-hover:text-amber-500">.</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* SOUND TOGGLE BUTTON */}
            <button
              onClick={toggleSound}
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold transition active:scale-95 hover:bg-black/5 flex items-center gap-1.5 touch-manipulation"
              title="Aktifkan / Matikan Suara Interactive"
            >
              <span>{soundOn ? '🔊' : '🔈'}</span>
              <span className="hidden sm:inline">{soundOn ? 'Suara ON' : 'Suara OFF'}</span>
            </button>

            {user ? (
              <>
                {isPengurus && (
                  <button
                    onClick={() => {
                      soundEngine.playPop()
                      setShowDashboard(!showDashboard)
                    }}
                    className="rounded-full border border-black px-3.5 py-1.5 text-xs font-semibold transition hover:bg-black hover:text-white active:scale-95 touch-manipulation sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {showDashboard ? 'Beranda' : 'Dashboard'}
                  </button>
                )}

                <button
                  onClick={logout}
                  className="rounded-full bg-black px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-black/80 active:scale-95 touch-manipulation"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playPop()
                  setShowLogin(true)
                }}
                className="rounded-full bg-black px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-black/80 active:scale-95 touch-manipulation"
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
        <main className="space-y-16 sm:space-y-24">
          {/* HERO SECTION */}
          <section className="mx-auto max-w-6xl px-5 pt-12 sm:pt-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold uppercase tracking-[0.15em] text-black/70">
                <span>🏫 SMA Negeri 1 Pandaan</span>
                <span>•</span>
                <span>Class X-B</span>
              </div>

              <SplitText 
                text="Everything about our class."
                className="text-4xl text-left font-extrabold leading-[1.05] tracking-tight sm:text-7xl"
                delay={40}
                duration={1.0}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="left"
                onLetterAnimationComplete={() => {}}
                showCallback
              />

              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
                Who we are? We are Bhuvanasura. Semua daftar informasi di kelas X-B
              </p>

              {/* VISITOR ACTION BUTTONS */}
              <div className="mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button
                  onClick={(e) => openVisitorModal('tugas', e)}
                  className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80 active:scale-95 touch-manipulation shadow-md flex items-center gap-2"
                >
                  <span>📝</span>
                  <span>Lihat Tugas</span>
                </button>
                <button
                  onClick={(e) => openVisitorModal('ulangan', e)}
                  className="rounded-full border border-black/20 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white active:scale-95 touch-manipulation flex items-center gap-2"
                >
                  <span>📅</span>
                  <span>Lihat Ulangan</span>
                </button>
                <button
                  onClick={(e) => openVisitorModal('kisi', e)}
                  className="rounded-full border border-black/20 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white active:scale-95 touch-manipulation flex items-center gap-2"
                >
                  <span>📌</span>
                  <span>Lihat Kisi-kisi</span>
                </button>
                <button
                  onClick={(e) => openVisitorModal('gallery', e)}
                  className="rounded-full border border-black/20 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white active:scale-95 touch-manipulation flex items-center gap-2"
                >
                  <span>🖼️</span>
                  <span>Gallery Foto</span>
                </button>
              </div>
            </div>
          </section>

          {/* DYNAMIC COUNTDOWN WIDGET */}
          <section className="mx-auto max-w-6xl px-5">
            <ExamCountdown tasks={tugas} exams={ulangan} onOpenModal={openVisitorModal} />
          </section>

          {/* FEATURE CARDS */}
          <section className="border-y border-black/10 bg-neutral-50/50">
            <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Feature
                number="01"
                title="Daftar Tugas"
                description="Pantau tenggat & instruksi tugas kelas."
                onClick={(e) => openVisitorModal('tugas', e)}
              />

              <Feature
                number="02"
                title="Jadwal Ulangan"
                description="Persiapkan penilaian harian & ujian."
                onClick={(e) => openVisitorModal('ulangan', e)}
              />

              <Feature
                number="03"
                title="Kisi-kisi Ujian"
                description="Rangkuman materi penting untuk dipelajari."
                onClick={(e) => openVisitorModal('kisi', e)}
              />

              <Feature
                number="04"
                title="Galeri Kelas"
                description="Dokumentasi keseruan momen X-B."
                onClick={(e) => openVisitorModal('gallery', e)}
              />
            </div>
          </section>

          {/* RANDOM STUDENT / PIKET PICKER WHEEL */}
          <section className="mx-auto max-w-6xl px-5">
            <RandomPickerWheel />
          </section>

          {/* INFO BANNER */}
          <section className="mx-auto max-w-6xl px-5">
            <div className="flex flex-col gap-5 rounded-3xl bg-white p-8 text-black sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold">
                Class X-B · SMA Negeri 1 Pandaan
              </p>

              <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl font-roboto">
                One place. Everything we need.
              </h2>

              <p className="max-w-xl text-black/70 text-sm sm:text-base leading-relaxed">
                Semua informasi penting di kelas akan di update secara berkala.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={(e) => openVisitorModal('tugas', e)}
                  className="rounded-full bg-white text-black px-6 py-3 text-sm font-bold hover:bg-neutral-200 transition active:scale-95 touch-manipulation shadow-lg"
                >
                  Jelajahi Informasi Kelas
                </button>
              </div>
            </div>
          </section>

          {/* ART OF XB CAROUSEL */}
          <section className="space-y-4">
            <div className="mx-auto max-w-6xl px-5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">📸 Galeri Momen Kelas X-B</h3>
                <p className="text-xs text-black/50">Geser atau ketuk foto untuk melihat dalam tampilan interaktif.</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '520px', position: 'relative' }}>
              <FlexCarousel
                items={items}
                preset="liquid"
                intro="rise"
                cardHeight={0.5}
                gap={12}
                squeeze={0.2}
                focusOnClick
                captions
                fit="natural"
                radius={0}
                lensWidth={0.74}
                lensHeight={1.18}
                tilt={62}
                roundness={1}
                bend={0.34}
                reach={0.38}
                curl="twist"
                dispersion={0.45}
                liquid={0}
                followCursor={false}
                autoplay={false}
                interval={4}
                captureWheel
              />
            </div>
          </section>

          {/* FLIP CARD BHUVANASURA */}
          <section className="mx-auto max-w-6xl px-5 py-8 flex flex-col items-center justify-center">
            <div className="text-center mb-6 max-w-md">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Filosofi Bhuvanasura
              </span>
              <h3 className="text-2xl font-bold tracking-tight mt-2">X Bhuvanasura</h3>
              <p className="text-xs text-black/50 mt-1">Klik untuk flip kartu</p>
            </div>

            <FlipCard 
              front={
                <img 
                  src={logoImg} 
                  alt="Logo Bhuvanasura X-B" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              }
              back={
                <div style={{ padding: 24 }} className="flex flex-col justify-center h-full text-center">
                  <h3 className="font-bold text-xl text-amber-400">Filosofi Bhuvanasura</h3>
                  <div className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-200">
                    <p><strong className="text-white">Bhuvana:</strong> Tegese dunya, bumi, jagad, utawa papan panggonan.</p>
                    <p><strong className="text-white">Asura:</strong> Tegese kekuatan besar, raksasa, lan semangat pantang menyerah.</p>
                  </div>
                </div>
              }
              axis="y"
              flipOnClick
              draggable
              dragDistance={0}
              tilt
              tiltMax={12}
              glare
              glareOpacity={0.22}
              hoverScale={1.03}
              perspective={1100}
              stiffness={170}
              damping={20}
              width={300}
              height={400}
              radius={22}
              background="#18181b"
              color="#f5f5f5"
              shadow
              shadowColor="#000000"
              shadowOpacity={0.45}
              onFlipChange={(flipped) => {
                soundEngine.playSwoosh()
              }}
            />
          </section>

          {/* MESSAGE */}
          <div>
            <Stepper
              initialStep={1}
              onStepChange={(step) => {
                console.log(step);
              }}
              onFinalStepCompleted={async () => {
                const { error } = await supabase
                  .from('messages')
                  .insert({
                    name: form.name || null,
                    anonymous: !form.name,
                    message: form.message,
                    target: form.target || null,
                    important: form.important,
                  })

                  if (error) {
                    console.error('SUPABASE ERROR')
                    console.error('code:', error.code)
                    console.error('message:', error.message)
                    console.error('details:', error.details)
                    console.error('hint:', error.hint)
                    return
                  }

                  console.log('Message was recorded')
              }}
              backButtonText="Back"
              nextButtonText="Next"
            >
              <Step>
                <div className="font-roboto text-sm text-black/70">
                  <h2>Pernah ga si....</h2>
                  <p>Mau ngomong langsung kayak malu gitu!?</p>
                  <p>Gimana kalo kita adain <strong>BOTB - BHUVANASURA ONTO THE BOX</strong></p>
                </div>
              </Step>
              <Step>
                <p>Opsional aja sih, kalo ga ngisi yaudah</p>
                <input value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  placeholder="Ke siapa nih?"
                />
              </Step>
              <Step>
                <h2>Ini juga opsional sih, kalo ngisi ya yaudah</h2>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kalo nama kamu?"
              disableStepIndicators={false}
            />
              </Step>
              <Step>
                <h2>Mau ngomong apa nih</h2>

                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Pesanmu apa nih...." rows={5} />
              </Step>
              <Step>
                <h2 className="font-bold">WEIT WEIT</h2>
                <p>udah bener kan? datamu ke record ke database loh nanti</p>
              </Step>
            </Stepper>
          </div>

          {/* FOOTER */}
          <footer className="border-t border-black/10 py-10 text-center">
            <p className="font-roboto text-xs text-black/60">
              Made with ❤️ by Human.
            </p>
          </footer>
        </main>
      )}

      {/* MOBILE QUICK BOTTOM ACTION BAR */}
      {!showDashboard && (
        <div className="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md text-black px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <button
            onClick={(e) => openVisitorModal('tugas', e)}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 active:scale-95 touch-manipulation flex items-center gap-1"
          >
            <span>📝</span>
            <span>Tugas</span>
          </button>
          <button
            onClick={(e) => openVisitorModal('ulangan', e)}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 active:scale-95 touch-manipulation flex items-center gap-1"
          >
            <span>📅</span>
            <span>Ulangan</span>
          </button>
          <button
            onClick={(e) => openVisitorModal('gallery', e)}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 active:scale-95 touch-manipulation flex items-center gap-1"
          >
            <span>🖼️</span>
            <span>Galeri</span>
          </button>
          <button
            onClick={toggleSound}
            className="text-xs p-1.5 rounded-full bg-white/20 active:scale-95 touch-manipulation"
            title="Toggle Sound"
          >
            {soundOn ? '🔊' : '🔈'}
          </button>
        </div>
      )}

      {/* VISITOR MODAL VIEWER */}
      <AnimatePresence>
      {visitorModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-white p-6 shadow-2xl overflow-hidden border border-black/10"
          >
            {/* Modal Header & Tabs */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Informasi Kelas X-B</h2>
                <p className="text-xs text-black/50">Pilih kategori untuk melihat informasi lengkap.</p>
              </div>
              <button
                onClick={() => {
                  soundEngine.playPop()
                  setVisitorModal({ isOpen: false, activeTab: 'tugas' })
                }}
                className="rounded-full bg-black/5 p-2 text-black/60 hover:bg-black hover:text-white transition text-sm w-8 h-8 flex items-center justify-center active:scale-95 touch-manipulation"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex border-b border-black/10 overflow-x-auto py-3 gap-2 scrollbar-none">
              {[
                { id: 'tugas', label: '📝 Tugas' },
                { id: 'ulangan', label: '📅 Ulangan' },
                { id: 'kisi', label: '📌 Kisi-kisi' },
                { id: 'gallery', label: '🖼️ Gallery' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playPop()
                    setVisitorModal({ ...visitorModal, activeTab: tab.id })
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap active:scale-95 touch-manipulation ${
                    visitorModal.activeTab === tab.id
                      ? 'bg-black text-white shadow-md'
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
                  {tugas.length > 0 ? (
                    tugas.map((t) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-black/40">Belum ada tugas saat ini.</div>
                  )}
                </div>
              )}

              {/* ULANGAN VIEW */}
              {visitorModal.activeTab === 'ulangan' && (
                <div className="space-y-3">
                  {ulangan.length > 0 ? (
                    ulangan.map((u) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-black/40">Belum ada jadwal ulangan.</div>
                  )}
                </div>
              )}

              {/* KISI-KISI VIEW */}
              {visitorModal.activeTab === 'kisi' && (
                <div className="space-y-3">
                  {kisi.length > 0 ? (
                    kisi.map((k) => (
                      <div key={k.id} className="p-4 border border-black/10 rounded-2xl bg-neutral-50 hover:border-black/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-base">{k.subject}</h3>
                          <p className="text-xs text-black/60 mt-1">{k.note}</p>
                          <p className="text-xs font-mono text-black/40 mt-1">📁 {k.file}</p>
                        </div>
                        <button
                          onClick={() => {
                            soundEngine.playChime()
                            alert(`Mengunduh file: ${k.file}`)
                          }}
                          className="self-start sm:self-auto text-xs bg-black text-white px-3.5 py-2 rounded-xl font-medium hover:bg-black/80 transition active:scale-95 touch-manipulation"
                        >
                          Download
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-black/40">Belum ada kisi-kisi diunggah.</div>
                  )}
                </div>
              )}

              {/* GALLERY VIEW */}
              {visitorModal.activeTab === 'gallery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.length > 0 ? (
                    gallery.map((g) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-black/40 col-span-2">Belum ada foto galeri.</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* LOGIN MODAL */}
      <AnimatePresence>
      {showLogin && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 backdrop-blur-xs"
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onSubmit={login}
            className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl border border-black/10"
          >
            <div className="mb-7">
              <h2 className="text-2xl font-bold">Login Pengurus</h2>
              <p className="mt-1 text-xs text-black/50">
                Masuk sebagai pengurus kelas X-B.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-black text-sm"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-black text-sm"
                required
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop()
                  setShowLogin(false)
                }}
                className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold active:scale-95 touch-manipulation"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white active:scale-95 touch-manipulation shadow-md"
              >
                Login
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

function Feature({ number, title, description, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className="border-b border-black/10 p-7 sm:border-r lg:border-b-0 cursor-pointer group touch-manipulation"
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
    </motion.div>
  )
}

export default App