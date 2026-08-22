export type VMStatus = 'running' | 'stopped' | 'paused' | 'saving' | 'restoring';
export type OSType = 'linux' | 'windows' | 'macos' | 'other';
export type NetMode = 'NAT' | 'Bridged' | 'Host-only' | 'Internal';
export type DiskType = 'SSD' | 'HDD' | 'NVMe';

export interface NetworkAdapter {
  id: string;
  mode: NetMode;
  mac: string;
  ip: string;
  enabled: boolean;
}

export interface Disk {
  id: string;
  label: string;
  type: DiskType;
  size: number; // GB
  used: number; // GB
  path: string;
}

export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  size: number; // MB
  description: string;
  isCurrent: boolean;
}

export interface LogEntry {
  ts: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export interface VM {
  id: string;
  name: string;
  os: OSType;
  status: VMStatus;
  cpu: { cores: number; usage: number; model: string };
  ram: { total: number; used: number }; // GB
  disks: Disk[];
  network: NetworkAdapter[];
  snapshots: Snapshot[];
  logs: LogEntry[];
  uptime: number; // seconds
  ip: string;
  description: string;
}
