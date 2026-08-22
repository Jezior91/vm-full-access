# VM Full Access

Interaktywny menedżer maszyn wirtualnych z pełnym dostępem — zbudowany w React + TypeScript.

## Funkcje

- 🖥️ **Terminal** — emulator bash z historią komend (ls, cd, ps, top, ip addr, docker ps…)
- ⚙️ **Sprzęt** — konfiguracja CPU/RAM, dysków NVMe/SSD, adaptera sieciowego
- 📷 **Snapshoty** — tworzenie, przywracanie, usuwanie
- 📋 **Logi** — widok logów z filtrowaniem INFO/WARN/ERROR

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Tasklet Instant App

## Struktura

```
app.tsx                  # Główny komponent
types.ts                 # Typy TypeScript
data.ts                  # Dane początkowe VM
components/
  Terminal.tsx           # Emulator terminala
  HardwareTab.tsx        # Konfiguracja sprzętu
  SnapshotsTab.tsx       # Zarządzanie snapshotami
  LogsTab.tsx            # Przeglądarka logów
  UI.tsx                 # Wspólne komponenty UI
```
