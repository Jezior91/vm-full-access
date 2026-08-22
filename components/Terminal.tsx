import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal as TermIcon } from 'lucide-react';
import { TerminalLine } from '../types';
import { TERMINAL_WELCOME, FS_TREE } from '../data';

const FILE_CONTENTS: Record<string, string> = {
  '/etc/hosts':   '127.0.0.1   localhost\n192.168.1.101   ubuntu-server\n10.0.2.15   nat-interface',
  '/etc/fstab':   '/dev/vda1  /       ext4  defaults  0 1\n/dev/vdb1  /data   ext4  defaults  0 2',
  '/etc/crontab': '0 2 * * *  root  /opt/backups/backup.sh\n*/5 * * * *  ubuntu  /home/ubuntu/scripts/monitor.sh',
  '.bashrc':      'export PATH="$HOME/.local/bin:$PATH"\nalias ll="ls -alF"\nalias gs="git status"\nexport EDITOR=vim',
};

const ERROR_TOKENS = ['Brak', 'nie znalezione', 'nie można', 'usage:'];

function isErrorLine(line: string) {
  return ERROR_TOKENS.some(t => line.includes(t));
}

function processCommand(cmd: string, cwd: string, setCwd: (p: string) => void): string[] {
  const parts = cmd.trim().split(/\s+/);
  const bin = parts[0];
  const args = parts.slice(1);
  if (!bin) return [];

  switch (bin) {
    case 'help':
      return [
        'Dostępne komendy:',
        '  ls [ścieżka]     — lista plików',
        '  cd <ścieżka>     — zmień katalog',
        '  pwd              — bieżący katalog',
        '  cat <plik>       — wyświetl plik',
        '  echo <tekst>     — wyświetl tekst',
        '  uname -a         — info o systemie',
        '  free -h          — pamięć RAM',
        '  df -h            — dyski',
        '  ps aux           — procesy',
        '  top              — statystyki CPU',
        '  ip addr          — interfejsy sieciowe',
        '  docker ps        — kontenery',
        '  systemctl status — usługi',
        '  uptime           — czas działania',
        '  whoami           — bieżący użytkownik',
        '  ping <host>      — test połączenia',
        '  clear            — wyczyść terminal',
      ];
    case 'clear':    return ['__CLEAR__'];
    case 'pwd':      return [cwd];
    case 'whoami':   return ['ubuntu'];
    case 'uname':    return ['Linux ubuntu-server 6.8.0-41-generic #41-Ubuntu SMP x86_64 GNU/Linux'];
    case 'uptime':   return ['04:15:00 up  5:09,  2 users,  load average: 0.34, 0.28, 0.21'];
    case 'free':
      return [
        '               total        used        free      shared  buff/cache   available',
        'Mem:            16Gi       6.2Gi       4.1Gi       312Mi       5.6Gi       9.1Gi',
        'Swap:          2.0Gi          0B       2.0Gi',
      ];
    case 'df':
      return [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/vda1       128G   42G   82G  34% /',
        '/dev/vdb1       512G  210G  290G  42% /data',
        'tmpfs           8.0G  312M  7.7G   4% /dev/shm',
      ];
    case 'ps':
      return [
        'USER       PID %CPU %MEM COMMAND',
        'root         1  0.0  0.1 /sbin/init',
        'root       812  0.0  0.2 /usr/sbin/sshd',
        'www-data  1234  0.1  0.4 nginx: worker',
        'postgres  1456  0.3  1.2 postgres: main',
        'root      2001  0.0  0.3 dockerd',
        'ubuntu    3001  0.0  0.1 bash',
      ];
    case 'top':
      return [
        'top - 04:15:01 up 5:09, 2 users, load avg: 0.34, 0.28, 0.21',
        'Tasks: 124 total,  1 running, 123 sleeping',
        '%Cpu(s):  3.4 us,  1.2 sy, 94.8 id',
        '  PID USER     %CPU %MEM  COMMAND',
        ' 1456 postgres  3.4  1.2  postgres',
        ' 1234 www-data  1.1  0.4  nginx',
        ' 2001 root      0.3  0.3  dockerd',
      ];
    case 'ip':
      return [
        '1: lo: <LOOPBACK,UP>  inet 127.0.0.1/8',
        '2: eth0: <BROADCAST,UP>  inet 10.0.2.15/24',
        '3: eth1: <BROADCAST,UP>  inet 192.168.1.101/24',
      ];
    case 'docker':
      if (args[0] === 'ps') return [
        'CONTAINER ID  IMAGE         STATUS    PORTS                NAMES',
        'a1b2c3d4e5f6  nginx:latest  Up 2h     0.0.0.0:80->80/tcp   web',
        'b2c3d4e5f6a1  postgres:16   Up 2h     5432/tcp             db',
        'c3d4e5f6a1b2  redis:7       Up 2h     6379/tcp             cache',
      ];
      return [`docker: '${args[0]}' — spróbuj 'docker ps'`];
    case 'systemctl':
      return [
        '● nginx       active (running) — port 80',
        '● postgresql  active (running) — port 5432',
        '● docker      active (running)',
        '● ssh         active (running) — port 22',
      ];
    case 'ls': {
      const target = args[0]
        ? (args[0].startsWith('/') ? args[0] : `${cwd}/${args[0]}`.replace(/\/+/g, '/'))
        : cwd;
      const entries = FS_TREE[target];
      if (!entries) return [`ls: nie można uzyskać dostępu do '${args[0] || cwd}': Brak katalogu`];
      return [entries.join('  ')];
    }
    case 'cd': {
      if (!args[0] || args[0] === '~') { setCwd('/home/ubuntu'); return []; }
      const next = args[0].startsWith('/')
        ? args[0]
        : `${cwd}/${args[0]}`.replace(/\/+/g, '/');
      if (FS_TREE[next] !== undefined) { setCwd(next); return []; }
      return [`bash: cd: ${args[0]}: Brak pliku lub katalogu`];
    }
    case 'cat': {
      if (!args[0]) return ['usage: cat <plik>'];
      const full = args[0].startsWith('/') ? args[0] : `${cwd}/${args[0]}`.replace(/\/+/g, '/');
      const content = FILE_CONTENTS[full] ?? FILE_CONTENTS[args[0]];
      return content ? content.split('\n') : [`cat: ${args[0]}: Brak pliku lub katalogu`];
    }
    case 'echo':  return [args.join(' ')];
    case 'ping':  return args[0]
      ? [`PING ${args[0]}: 56 bytes`, `64 bytes from ${args[0]}: icmp_seq=1 time=0.42 ms`, `1 pakiet nadany, 1 odebrany, 0% strat`]
      : ['usage: ping <host>'];
    case 'ssh':   return ['ssh: połączenie symulowane — Full Access Mode'];
    case 'sudo':  return ['ubuntu nie jest w grupie sudoers. Ten incydent zostanie odnotowany. (demo)'];
    default:      return [`${bin}: polecenie nie znalezione`];
  }
}

let _lineId = 0;
const mkLine = (type: TerminalLine['type'], text: string): TerminalLine => ({ id: ++_lineId, type, text });

export const Terminal: React.FC<{ running: boolean }> = ({ running }) => {
  const [lines, setLines] = useState<TerminalLine[]>(() =>
    TERMINAL_WELCOME.map(t => mkLine('system', t))
  );
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [cwd, setCwd] = useState('/home/ubuntu');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  const handleCommand = useCallback(() => {
    const cmd = input.trim();
    if (!cmd) return;
    setLines(prev => [...prev, mkLine('input', `ubuntu@ubuntu-server:${cwd}$ ${cmd}`)]);
    setHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');
    if (cmd === 'clear') { setLines([]); return; }
    const output = processCommand(cmd, cwd, setCwd);
    if (output.length) {
      setLines(prev => [
        ...prev,
        ...output.map(o => mkLine(isErrorLine(o) ? 'error' : 'output', o)),
      ]);
    }
  }, [input, cwd]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleCommand(); return; }
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx); setInput(history[idx] ?? '');
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx); setInput(idx === -1 ? '' : history[idx]);
    }
  };

  if (!running) return (
    <div className="bg-base-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-base-content/50 min-h-64">
      <TermIcon size={40} />
      <p>Terminal niedostępny — uruchom maszynę</p>
    </div>
  );

  return (
    <div className="bg-[#0d1117] rounded-xl overflow-hidden flex flex-col" style={{ minHeight: '420px' }}>
      {/* Pasek tytułowy */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <span className="w-3 h-3 rounded-full bg-error opacity-80" />
        <span className="w-3 h-3 rounded-full bg-warning opacity-80" />
        <span className="w-3 h-3 rounded-full bg-success opacity-80" />
        <span className="ml-2 text-xs text-[#7d8590] font-mono">ubuntu@ubuntu-server — bash</span>
      </div>

      {/* Obszar wyjścia */}
      <div
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-0.5 cursor-text"
        style={{ maxHeight: '380px' }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map(l => (
          <div key={l.id} className={
            l.type === 'input'  ? 'text-[#58a6ff]' :
            l.type === 'error'  ? 'text-[#f85149]' :
            l.type === 'system' ? 'text-[#3fb950]' :
                                  'text-[#c9d1d9]'
          }>
            {l.text || '\u00A0'}
          </div>
        ))}

        {/* Wiersz wejścia */}
        <div className="flex items-center gap-1 text-[#58a6ff]">
          <span className="text-[#3fb950]">ubuntu@ubuntu-server</span>
          <span className="text-[#7d8590]">:</span>
          <span className="text-[#58a6ff]">{cwd}</span>
          <span className="text-[#c9d1d9]">$</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-[#c9d1d9] caret-[#c9d1d9] ml-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
