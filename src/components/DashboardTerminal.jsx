import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── ANSI-style color tags (rendered as inline spans) ───────────────────────
const C = {
  ok:      (t) => ({ text: t, color: '#16a34a' }),   // green
  err:     (t) => ({ text: t, color: '#dc2626' }),   // red
  info:    (t) => ({ text: t, color: '#2563eb' }),   // blue
  warn:    (t) => ({ text: t, color: '#d97706' }),   // amber
  muted:   (t) => ({ text: t, color: '#6b7280' }),   // gray
  bold:    (t) => ({ text: t, color: '#111827', bold: true }),
  plain:   (t) => ({ text: t, color: '#374151' }),
};

const ts = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// ─── TABLE RENDERER ──────────────────────────────────────────────────────────
function TermTable({ rows, cols }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="overflow-x-auto mt-1">
      <table className="text-xs border-collapse min-w-full font-mono">
        <thead>
          <tr className="border-b border-black/10">
            {cols.map((c) => (
              <th key={c} className="text-left px-3 py-1 font-semibold text-black/50 whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-black/5 hover:bg-black/[0.02]">
              {cols.map((c) => (
                <td key={c} className="px-3 py-1 text-black/80 max-w-[260px] truncate" title={String(row[c] ?? '')}>
                  {String(row[c] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── OUTPUT LINE ─────────────────────────────────────────────────────────────
function OutputLine({ line }) {
  const { timestamp, segments, table } = line;
  return (
    <div className="py-0.5 group">
      <div className="flex items-start gap-2">
        <span className="text-[10px] font-mono text-black/25 shrink-0 pt-[1px] opacity-0 group-hover:opacity-100 transition-opacity select-none">
          {timestamp}
        </span>
        <p className="font-mono text-xs leading-5 break-all whitespace-pre-wrap">
          {segments.map((seg, i) => (
            <span key={i} style={{ color: seg.color, fontWeight: seg.bold ? '700' : undefined }}>
              {seg.text}
            </span>
          ))}
        </p>
      </div>
      {table && <div className="ml-12">{table}</div>}
    </div>
  );
}

// ─── COMMAND DEFINITIONS ─────────────────────────────────────────────────────
const COMMANDS = [
  'help', 'clear', 'ping', 'status',
  'list tasks', 'list exams', 'list guides', 'list gallery', 'list all',
  'count',
  'reload tasks', 'reload exams', 'reload guides', 'reload gallery', 'reload all',
  'add task', 'add exam',
  'delete task', 'delete exam',
  'whoami', 'version',
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DashboardTerminal() {
  const [history, setHistory] = useState([
    {
      timestamp: ts(),
      segments: [
        C.bold('help'), C.muted(' for commands'),
      ],
    },
    {
      timestamp: ts(),
      segments: [C.muted('──────────────────────────────────────────────────')],
    },
  ]);

  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggIndex, setSuggIndex] = useState(-1);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const push = useCallback((lines) => {
    setHistory((prev) => [...prev, ...lines]);
  }, []);

  const pushLine = useCallback((segments, table = null) => {
    push([{ timestamp: ts(), segments, table }]);
  }, [push]);

  // ─── COMMAND ENGINE ─────────────────────────────────────────────────────────
  const runCommand = useCallback(async (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    // Echo the command
    pushLine([C.muted('$ '), C.bold(raw)]);
    setLoading(true);

    try {
      // ── help ──────────────────────────────────────────────────────────────
      if (cmd === 'help') {
        push([
          { timestamp: ts(), segments: [C.info('Available commands:')] },
          { timestamp: ts(), segments: [C.muted('  Database:'), C.plain('')] },
          { timestamp: ts(), segments: [C.ok('    list tasks/exams/guides/gallery/all'), C.muted('  — fetch & display table data')] },
          { timestamp: ts(), segments: [C.ok('    count'), C.muted('                             — row count per table')] },
          { timestamp: ts(), segments: [C.ok('    reload tasks/exams/guides/gallery/all'), C.muted(' — re-fetch data')] },
          { timestamp: ts(), segments: [C.ok('    add task'), C.muted('   — interactive: add task prompt')] },
          { timestamp: ts(), segments: [C.ok('    add exam'), C.muted('   — interactive: add exam prompt')] },
          { timestamp: ts(), segments: [C.ok('    delete task <id>'), C.muted(' — delete task by ID')] },
          { timestamp: ts(), segments: [C.ok('    delete exam <id>'), C.muted(' — delete exam by ID')] },
          { timestamp: ts(), segments: [C.muted('  System:'), C.plain('')] },
          { timestamp: ts(), segments: [C.ok('    ping'), C.muted('    — test Supabase connectivity')] },
          { timestamp: ts(), segments: [C.ok('    status'), C.muted('  — show DB session & env info')] },
          { timestamp: ts(), segments: [C.ok('    whoami'), C.muted('  — show current logged-in user')] },
          { timestamp: ts(), segments: [C.ok('    version'), C.muted(' — app build info')] },
          { timestamp: ts(), segments: [C.ok('    clear'), C.muted('   — clear terminal output')] },
        ]);
      }

      // ── clear ─────────────────────────────────────────────────────────────
      else if (cmd === 'clear') {
        setHistory([{
          timestamp: ts(),
          segments: [C.muted('Terminal cleared. Type '), C.bold('help'), C.muted(' to see commands.')],
        }]);
      }

      // ── ping ──────────────────────────────────────────────────────────────
      else if (cmd === 'ping') {
        const t0 = performance.now();
        const { error } = await supabase.from('tasks').select('id').limit(1);
        const ms = Math.round(performance.now() - t0);
        if (error) {
          pushLine([C.err('✗ PONG FAILED  '), C.muted(`(${ms} ms)  `), C.err(error.message)]);
        } else {
          pushLine([C.ok(`✓ PONG  `), C.muted(`latency: `), C.info(`${ms} ms`), C.muted('  — Supabase reachable')]);
        }
      }

      // ── status ────────────────────────────────────────────────────────────
      else if (cmd === 'status') {
        const { data: { session } } = await supabase.auth.getSession();
        const url = import.meta.env.VITE_SUPABASE_URL || '(env not exposed)';
        push([
          { timestamp: ts(), segments: [C.info('─── Connection Status ───────────────────────')] },
          { timestamp: ts(), segments: [C.muted('  Project URL : '), C.plain(url)] },
          { timestamp: ts(), segments: [C.muted('  Auth        : '), session ? C.ok('Authenticated') : C.warn('Anonymous')] },
          { timestamp: ts(), segments: [C.muted('  User email  : '), C.plain(session?.user?.email ?? '—')] },
          { timestamp: ts(), segments: [C.muted('  User role   : '), C.plain(session?.user?.role ?? '—')] },
          { timestamp: ts(), segments: [C.muted('  SDK         : '), C.plain('@supabase/supabase-js')] },
          { timestamp: ts(), segments: [C.muted('  Runtime     : '), C.plain(`Browser / React ${__REACT_VERSION__ ?? '19'}`)] },
        ]);
      }

      // ── whoami ────────────────────────────────────────────────────────────
      else if (cmd === 'whoami') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          pushLine([C.warn('Not logged in — session is anonymous.')]);
        } else {
          push([
            { timestamp: ts(), segments: [C.muted('  ID    : '), C.plain(user.id)] },
            { timestamp: ts(), segments: [C.muted('  Email : '), C.plain(user.email)] },
            { timestamp: ts(), segments: [C.muted('  Role  : '), C.ok(user.role ?? 'authenticated')] },
            { timestamp: ts(), segments: [C.muted('  Since : '), C.plain(new Date(user.created_at).toLocaleString('id-ID'))] },
          ]);
        }
      }

      // ── version ───────────────────────────────────────────────────────────
      else if (cmd === 'version') {
        push([
          { timestamp: ts(), segments: [C.bold('Kelas XB Dashboard Terminal'), C.muted(' — v2.0.0')] },
          { timestamp: ts(), segments: [C.muted('  Built with: '), C.plain('React 19 · Tailwind CSS v4 · Supabase · Vite 8')] },
          { timestamp: ts(), segments: [C.muted('  Class     : '), C.plain('X-B SMA Negeri 1 Pandaan')] },
          { timestamp: ts(), segments: [C.muted('  Dev       : '), C.info('Ardyan')] },
        ]);
      }

      // ── count ─────────────────────────────────────────────────────────────
      else if (cmd === 'count') {
        const tables = [
          { name: 'tasks',        label: 'Tugas' },
          { name: 'exams',        label: 'Ulangan' },
          { name: 'study_guides', label: 'Kisi-kisi' },
          { name: 'gallery',      label: 'Gallery' },
          { name: 'schedule',     label: 'Jadwal' },
        ];
        pushLine([C.info('Fetching row counts...')]);
        const results = await Promise.all(
          tables.map(async (t) => {
            const { count, error } = await supabase.from(t.name).select('*', { count: 'exact', head: true });
            return { Table: t.label, 'DB Table': t.name, Rows: error ? `ERROR: ${error.message}` : count };
          })
        );
        pushLine(
          [C.ok('✓ Row counts:')],
          <TermTable rows={results} cols={['Table', 'DB Table', 'Rows']} />
        );
      }

      // ── list tasks ────────────────────────────────────────────────────────
      else if (cmd === 'list tasks' || cmd === 'list task') {
        const { data, error } = await supabase.from('tasks').select('id, subject, title, deadline').order('deadline', { ascending: true });
        if (error) { pushLine([C.err('✗ ' + error.message)]); }
        else if (!data.length) { pushLine([C.warn('No tasks found.')]); }
        else {
          pushLine([C.ok(`✓ tasks (${data.length} rows):`)], <TermTable rows={data} cols={['id', 'subject', 'title', 'deadline']} />);
        }
      }

      // ── list exams ────────────────────────────────────────────────────────
      else if (cmd === 'list exams' || cmd === 'list exam') {
        const { data, error } = await supabase.from('exams').select('id, subject, topic, date').order('date', { ascending: true });
        if (error) { pushLine([C.err('✗ ' + error.message)]); }
        else if (!data.length) { pushLine([C.warn('No exams found.')]); }
        else {
          pushLine([C.ok(`✓ exams (${data.length} rows):`)], <TermTable rows={data} cols={['id', 'subject', 'topic', 'date']} />);
        }
      }

      // ── list guides ───────────────────────────────────────────────────────
      else if (cmd === 'list guides' || cmd === 'list guide' || cmd === 'list kisi') {
        const { data, error } = await supabase.from('study_guides').select('id, subject, file, note').order('created_at', { ascending: false });
        if (error) { pushLine([C.err('✗ ' + error.message)]); }
        else if (!data.length) { pushLine([C.warn('No study guides found.')]); }
        else {
          pushLine([C.ok(`✓ study_guides (${data.length} rows):`)], <TermTable rows={data} cols={['id', 'subject', 'file', 'note']} />);
        }
      }

      // ── list gallery ──────────────────────────────────────────────────────
      else if (cmd === 'list gallery') {
        const { data, error } = await supabase.from('gallery').select('id, title, album, url').order('created_at', { ascending: false });
        if (error) { pushLine([C.err('✗ ' + error.message)]); }
        else if (!data.length) { pushLine([C.warn('No gallery items found.')]); }
        else {
          pushLine([C.ok(`✓ gallery (${data.length} rows):`)], <TermTable rows={data} cols={['id', 'title', 'album', 'url']} />);
        }
      }

      // ── list all ──────────────────────────────────────────────────────────
      else if (cmd === 'list all') {
        pushLine([C.info('Fetching all tables...')]);
        const tables = [
          { name: 'tasks',        cols: ['id', 'subject', 'title', 'deadline'],     order: 'deadline' },
          { name: 'exams',        cols: ['id', 'subject', 'topic', 'date'],          order: 'date' },
          { name: 'study_guides', cols: ['id', 'subject', 'file', 'note'],           order: 'created_at' },
          { name: 'gallery',      cols: ['id', 'title', 'album', 'url'],             order: 'created_at' },
          { name: 'schedule',     cols: ['id', 'day', 'subjects', 'created_at'],     order: 'created_at' },
        ];
        for (const t of tables) {
          const { data, error } = await supabase.from(t.name).select(t.cols.join(', ')).order(t.order, { ascending: true });
          if (error) {
            pushLine([C.err(`✗ ${t.name}: ${error.message}`)]);
          } else {
            push([{
              timestamp: ts(),
              segments: [C.info(`── ${t.name} `), C.muted(`(${data.length} rows) ──────────────`)],
              table: <TermTable rows={data} cols={t.cols} />,
            }]);
          }
        }
        pushLine([C.ok('✓ Done listing all tables.')]);
      }

      // ── reload * ──────────────────────────────────────────────────────────
      else if (cmd.startsWith('reload')) {
        const target = cmd.replace('reload', '').trim();
        const map = {
          tasks:   { from: 'tasks',        order: 'deadline' },
          exams:   { from: 'exams',        order: 'date' },
          guides:  { from: 'study_guides', order: 'created_at' },
          gallery: { from: 'gallery',      order: 'created_at' },
          schedule:{ from: 'schedule',     order: 'created_at' },
        };
        const targets = target === 'all' || !target
          ? Object.keys(map)
          : [target];

        for (const key of targets) {
          const t = map[key];
          if (!t) { pushLine([C.err(`Unknown table: ${key}`)]); continue; }
          const t0 = performance.now();
          const { count, error } = await supabase.from(t.from).select('*', { count: 'exact', head: true });
          const ms = Math.round(performance.now() - t0);
          if (error) {
            pushLine([C.err(`✗ ${t.from}: ${error.message}`)]);
          } else {
            pushLine([C.ok(`✓ ${t.from} reloaded`), C.muted(` — ${count} rows  (${ms} ms)`)]);
          }
        }
      }

      // ── add task ──────────────────────────────────────────────────────────
      else if (cmd === 'add task') {
        pushLine([
          C.warn('⚠ Interactive mode not supported in terminal.'),
        ]);
        pushLine([
          C.muted('  → Use the '), C.bold('Tugas'), C.muted(' tab to add a task via the form UI.'),
        ]);
        pushLine([
          C.info('  Tip: '), C.muted('Raw SQL insert is not permitted via browser client for safety.'),
        ]);
      }

      // ── add exam ──────────────────────────────────────────────────────────
      else if (cmd === 'add exam') {
        pushLine([C.warn('⚠ Interactive mode not supported in terminal.')]);
        pushLine([C.muted('  → Use the '), C.bold('Ulangan'), C.muted(' tab to add an exam via the form UI.')]);
      }

      // ── delete task <id> ──────────────────────────────────────────────────
      else if (cmd.startsWith('delete task ')) {
        const id = cmd.replace('delete task ', '').trim();
        if (!id || isNaN(Number(id))) {
          pushLine([C.err('Usage: delete task <numeric-id>')]);
        } else {
          const { error } = await supabase.from('tasks').delete().eq('id', Number(id));
          if (error) { pushLine([C.err('✗ ' + error.message)]); }
          else { pushLine([C.ok(`✓ Task #${id} deleted successfully.`)]); }
        }
      }

      // ── delete exam <id> ──────────────────────────────────────────────────
      else if (cmd.startsWith('delete exam ')) {
        const id = cmd.replace('delete exam ', '').trim();
        if (!id || isNaN(Number(id))) {
          pushLine([C.err('Usage: delete exam <numeric-id>')]);
        } else {
          const { error } = await supabase.from('exams').delete().eq('id', Number(id));
          if (error) { pushLine([C.err('✗ ' + error.message)]); }
          else { pushLine([C.ok(`✓ Exam #${id} deleted successfully.`)]); }
        }
      }

      // ── unknown ───────────────────────────────────────────────────────────
      else {
        pushLine([
          C.err(`Command not found: `), C.bold(raw),
          C.muted('  — type '), C.bold('help'), C.muted(' to see available commands.'),
        ]);
      }
    } catch (e) {
      pushLine([C.err('Runtime error: ' + e.message)]);
    } finally {
      setLoading(false);
    }
  }, [push, pushLine]);

  // ─── INPUT HANDLERS ──────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    // Submit
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!input.trim() || loading) return;
      setCmdHistory((prev) => [input, ...prev]);
      setHistIndex(-1);
      setSuggestions([]);
      runCommand(input);
      setInput('');
      return;
    }

    // History UP
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistIndex((prev) => {
        const next = Math.min(prev + 1, cmdHistory.length - 1);
        setInput(cmdHistory[next] ?? '');
        return next;
      });
    }

    // History DOWN
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistIndex((prev) => {
        if (prev <= 0) { setInput(''); return -1; }
        const next = prev - 1;
        setInput(cmdHistory[next] ?? '');
        return next;
      });
    }

    // Tab autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      const next = (suggIndex + 1) % suggestions.length;
      setSuggIndex(next);
      setInput(suggestions[next]);
    }

    // Escape: clear input
    if (e.key === 'Escape') {
      setInput('');
      setSuggestions([]);
      setSuggIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setHistIndex(-1);
    // autocomplete
    if (val.trim()) {
      const matches = COMMANDS.filter((c) => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
      setSuggestions(matches);
      setSuggIndex(-1);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm font-mono">
      {/* ── HEADER BAR ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-black/10 bg-neutral-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs font-semibold text-black/60 select-none tracking-wide">
            CLI
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              running...
            </span>
          )}
          <button
            onClick={() => {
              setHistory([{
                timestamp: ts(),
                segments: [C.muted('Terminal cleared. Type '), C.bold('help'), C.muted(' to see commands.')],
              }]);
            }}
            className="text-[10px] font-medium text-black/40 hover:text-black transition px-2 py-1 rounded hover:bg-black/5"
          >
            clear
          </button>
        </div>
      </div>

      {/* ── OUTPUT AREA ─────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <OutputLine key={i} line={line} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── AUTOCOMPLETE SUGGESTIONS ────────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div className="px-5 py-2 border-t border-black/5 bg-neutral-50 flex flex-wrap gap-1.5 shrink-0">
          {suggestions.slice(0, 8).map((s, i) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); setInput(s); setSuggestions([]); inputRef.current?.focus(); }}
              className={`text-[10px] px-2 py-0.5 rounded border font-mono transition ${
                i === suggIndex
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black/60 border-black/15 hover:border-black/40'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="text-[10px] text-black/30 self-center">Tab to cycle</span>
        </div>
      )}

      {/* ── INPUT ROW ───────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-black/10 flex items-center gap-2 bg-white shrink-0">
        <span className="text-xs font-semibold text-black/40 select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={loading ? 'running command...' : 'type a command (try: help)'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="flex-1 bg-transparent outline-none text-xs font-mono text-black placeholder:text-black/25 disabled:opacity-50"
        />
        {input && (
          <button
            onClick={() => { setInput(''); setSuggestions([]); inputRef.current?.focus(); }}
            className="text-black/25 hover:text-black transition text-sm leading-none"
          >
            ✕
          </button>
        )}
        <button
          onClick={() => { if (input.trim() && !loading) { setCmdHistory((p) => [input, ...p]); runCommand(input); setInput(''); setSuggestions([]); }}}
          disabled={!input.trim() || loading}
          className="text-[10px] font-semibold border border-black/20 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white transition disabled:opacity-30"
        >
          Run ↵
        </button>
      </div>

      {/* ── STATUS FOOTER ───────────────────────────────────────────────── */}
      <div className="px-5 py-2 border-t border-black/5 bg-neutral-50/80 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-black/30 font-mono">
          ↑↓ history &nbsp;·&nbsp; Tab autocomplete &nbsp;·&nbsp; Esc clear
        </span>
        <span className="text-[10px] text-black/30 font-mono">
          {cmdHistory.length} cmd{cmdHistory.length !== 1 ? 's' : ''} in history
        </span>
      </div>
    </div>
  );
}
