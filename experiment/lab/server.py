"""Local-only lab UI and controlled STL generation; no network services."""
from __future__ import annotations
import csv
import json
import math
import os
import re
import subprocess
import sys
import threading
import uuid
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'exports' / 'lab'
DEPS = ROOT / 'exports' / 'plan_b_200mm' / 'python_deps'
GENERATION_LOCK = threading.Lock()


def number(obj, key, low, high):
    value = float(obj[key])
    if not math.isfinite(value) or not low <= value <= high:
        raise ValueError(f'{key}: значение должно быть от {low} до {high}')
    return value


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(HERE), **kwargs)

    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status); self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    def do_GET(self):
        path = urlsplit(self.path).path
        files = {'/download/example-coupon.stl': ROOT / 'exports' / 'plan_b_200mm' / 'coupon_120x120x10_r5_gyroid50_cell12.stl'}
        match = re.fullmatch(r'/download/((?:lens|coupon)-[0-9a-f]{12}\.stl|profile-[0-9a-f]{12}\.csv)', path)
        if match:
            files[path] = OUT / match.group(1)
        if path not in files:
            return super().do_GET()
        p = files[path]
        if not p.is_file(): return self.send_error(404)
        self.send_response(200); self.send_header('Content-Type', 'application/octet-stream')
        self.send_header('Content-Length', str(p.stat().st_size)); self.send_header('Content-Disposition', f'attachment; filename="{p.name}"')
        self.end_headers()
        with p.open('rb') as src:
            import shutil
            shutil.copyfileobj(src, self.wfile)

    def do_POST(self):
        if self.path != '/api/generate': return self.send_error(404)
        if self.headers.get('Origin') not in (None, 'http://127.0.0.1:8765', 'http://localhost:8765'):
            return self.send_error(403)
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 100_000: raise ValueError('Слишком большой запрос')
            data = json.loads(self.rfile.read(length))
            OUT.mkdir(parents=True, exist_ok=True)
            env = os.environ.copy()
            env['PYTHONPATH'] = os.pathsep.join([str(ROOT), str(DEPS), env.get('PYTHONPATH', '')])
            kind = data['kind']
            rows_to_write = None
            run_id = uuid.uuid4().hex[:12]
            if kind == 'coupon':
                f = number(data, 'fraction', .05, .95)
                cell = number(data, 'cell', 5, 25)
                filename = f'coupon-{run_id}.stl'
                cmd = [sys.executable, '-m', 'tools.rounded_gyroid_coupon', '--fraction', str(f), '--cell', str(cell), '--voxel', '.4', '--out', str(OUT / filename)]
                output = '/download/' + filename
            elif kind == 'lens':
                diameter = number(data, 'diameter', 30, 200)
                cell = number(data, 'cell', 5, 25)
                solid_eps = number(data, 'solid_eps', 2.001, 10)
                rho_min = number(data, 'rho_min', 0, .95)
                rho_max = number(data, 'rho_max', .05, 1)
                cap = number(data, 'cap', 1, 180)
                shell = number(data, 'shell', 0, 4)
                if rho_min > rho_max: raise ValueError('Минимальное заполнение выше максимального')
                filename = f'lens-{run_id}.stl'
                profile_name = f'profile-{run_id}.csv'
                cmd = [sys.executable, '-m', 'tools.continuous_luneburg_gyroid', '--radius', str(diameter / 2), '--cell', str(cell), '--voxel', '.8', '--eps-solid', str(solid_eps), '--rho-min', str(rho_min), '--rho-max', str(rho_max), '--shell', str(shell), '--shell-cap-angle', str(cap), '--hemisphere', 'full', '--out', str(OUT / filename), '--profile-out', str(OUT / profile_name), '--verify-stl']
                if data.get('calibrated'):
                    rows = [(float(row['rho']), float(row['eps'])) for row in data.get('points', [])]
                    rows.sort()
                    if len(rows) < 2 or any(not (math.isfinite(r) and math.isfinite(e) and 0 < r < 1 and 1 < e < solid_eps) for r, e in rows) or any(a[0] >= b[0] or a[1] >= b[1] for a, b in zip(rows, rows[1:])):
                        raise ValueError('Для калибровки нужны минимум две точки: 0 < ρ < 1, 1 < ε < ε сплошного PLA; ρ и ε должны строго возрастать.')
                    calibration = OUT / f'calibration-{run_id}.csv'
                    rows_to_write = rows
                    cmd += ['--calibration-csv', str(calibration)]
                output = '/download/' + filename
            else: raise ValueError('Неизвестный тип')
            if not GENERATION_LOCK.acquire(blocking=False):
                return self.send_json(409, {'error': 'Другой расчёт уже выполняется; дождитесь его окончания.'})
            try:
                if rows_to_write is not None:
                    with calibration.open('w', encoding='utf-8', newline='') as f:
                        writer = csv.writer(f); writer.writerow(['rho', 'epsilon_eff']); writer.writerows(rows_to_write)
                result = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=1200)
            finally:
                GENERATION_LOCK.release()
            if result.returncode: return self.send_json(500, {'error': (result.stderr or result.stdout)[-3000:]})
            return self.send_json(200, {'file': output, 'profile': '/download/' + profile_name if kind == 'lens' else None, 'log': result.stdout[-2500:]})
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as e:
            return self.send_json(400, {'error': str(e)})
        except subprocess.TimeoutExpired:
            return self.send_json(500, {'error': 'Превышено время расчёта 20 минут'})


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8765), Handler)
    print('LINZA lab: http://127.0.0.1:8765/', flush=True)
    if '--no-browser' not in sys.argv: webbrowser.open('http://127.0.0.1:8765/')
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()

