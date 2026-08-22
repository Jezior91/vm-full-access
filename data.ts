import { VM } from './types';

export const INITIAL_VM: VM = {
  id: 'vm-001',
  name: 'Ubuntu Server 24.04 LTS',
  os: 'linux',
  status: 'running',
  ip: '192.168.1.101',
  description: 'Główny serwer produkcyjny — NGINX + PostgreSQL + Docker',
  cpu: { cores: 8, usage: 34, model: 'Intel Core i9-13900K (virtual)' },
  ram: { total: 16, used: 6.2 },
  disks: [
    { id: 'd1', label: 'System', type: 'NVMe', size: 128, used: 42, path: '/dev/vda' },
    { id: 'd2', label: 'Dane', type: 'SSD', size: 512, used: 210, path: '/dev/vdb' },
  ],
  network: [
    { id: 'n1', mode: 'NAT', mac: '52:54:00:AA:BB:01', ip: '10.0.2.15', enabled: true },
    { id: 'n2', mode: 'Bridged', mac: '52:54:00:AA:BB:02', ip: '192.168.1.101', enabled: true },
  ],
  snapshots: [
    { id: 's1', name: 'Czysta instalacja', createdAt: '2025-01-10 09:00', size: 3200, description: 'Świeży system bez konfiguracji', isCurrent: false },
    { id: 's2', name: 'Po konfiguracji NGINX', createdAt: '2025-02-14 14:30', size: 4800, description: 'NGINX + certbot skonfigurowany', isCurrent: false },
    { id: 's3', name: 'Przed aktualizacją jądra', createdAt: '2025-06-01 11:15', size: 6100, description: 'Snapshot przed kernel 6.8', isCurrent: true },
  ],
  logs: [
    { ts: '2026-07-29 04:10:01', level: 'info', message: 'VM uruchomiona pomyślnie' },
    { ts: '2026-07-29 04:10:05', level: 'info', message: 'Usługa NGINX wystartowała (PID 1234)' },
    { ts: '2026-07-29 04:10:06', level: 'info', message: 'PostgreSQL 16 gotowy na porcie 5432' },
    { ts: '2026-07-29 04:11:20', level: 'warn', message: 'Wysokie zużycie I/O na /dev/vdb (89 MB/s)' },
    { ts: '2026-07-29 04:12:00', level: 'info', message: 'Docker daemon uruchomiony, 3 kontenery aktywne' },
    { ts: '2026-07-29 04:14:55', level: 'error', message: 'Failed login attempt for user root from 203.0.113.42' },
    { ts: '2026-07-29 04:15:10', level: 'info', message: 'fail2ban: zablokowano 203.0.113.42 na 24h' },
  ],
  uptime: 18540,
};

export const TERMINAL_WELCOME: string[] = [
  '┌──────────────────────────────────────────────────────────┐',
  '│  VM Full Access — Terminal Emulator                      │',
  '│  Ubuntu Server 24.04 LTS  |  192.168.1.101              │',
  '└──────────────────────────────────────────────────────────┘',
  'Wpisz "help" aby zobaczyć dostępne komendy.',
  '',
];

export const FS_TREE: Record<string, string[]> = {
  '/': ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'opt', 'proc', 'root', 'srv', 'tmp', 'usr', 'var'],
  '/home': ['ubuntu', 'deploy'],
  '/home/ubuntu': ['projects', 'scripts', '.bashrc', '.ssh'],
  '/etc': ['nginx', 'postgresql', 'systemd', 'hosts', 'fstab', 'crontab'],
  '/var': ['log', 'www', 'lib', 'cache'],
  '/var/log': ['nginx', 'postgresql', 'syslog', 'auth.log', 'docker.log'],
  '/opt': ['docker', 'backups'],
};
