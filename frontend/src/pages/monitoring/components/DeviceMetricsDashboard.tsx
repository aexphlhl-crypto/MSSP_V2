/**
 * DeviceMetricsDashboard — Professional monitoring dashboard.
 *
 * ARCHITECTURE RULES:
 *  - Provider-agnostic: consumes only normalized contracts (NormalizedMetric shape
 *    reflected as DeviceMetricResponse) from the generic backend endpoints.
 *  - Does NOT reference Zabbix, Motadata, Prometheus, or any vendor.
 *  - Does NOT use providerMappings[0] array position — iterates all mappings by
 *    providerType === 'MONITORING' to find the active monitoring source.
 *  - No if (provider === 'ZABBIX') logic anywhere in this file.
 *  - Vendor-specific logic lives exclusively in ZabbixMonitoringProvider / ZabbixClient.
 *
 * Data contracts consumed:
 *  GET /monitoring/devices/{id}/metrics/latest  → DeviceMetricResponse (NormalizedMetric output)
 *  GET /monitoring/devices/{id}/metrics?since=  → DeviceMetricResponse[] (persisted history)
 *
 * Adding a new provider (e.g. Motadata) requires ZERO changes here.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../../api/axios';

// ─── Normalized contracts (mirror of backend DeviceMetricResponse) ─────────────

interface DeviceMetricResponse {
  id?: string;
  deviceId: string;
  collectedAt: string;
  cpuUsage: number | null;
  memoryUsage: number | null;
  diskUsage: number | null;
  networkIn: number | null;
  networkOut: number | null;
  uptimeSeconds: number | null;
}

/** Normalized provider mapping — only non-vendor fields used here */
interface MonitoringSourceInfo {
  /** Display label for the monitoring source, e.g. "ZABBIX", "MOTADATA" */
  providerName: string;
  providerDisplayName?: string;
  syncStatus: string;
  lastSyncedAt?: string;
  externalResourceId: string;
}

interface DeviceMetricsDashboardProps {
  deviceId: string;
  /** Raw device object from GET /monitoring/devices/{id} */
  device: {
    status?: string;
    cpuUsage?: number | null;
    memoryUsage?: number | null;
    diskUsage?: number | null;
    lastSeenAt?: string | null;
    /** All provider mappings — may include BACKUP, SECURITY, MONITORING types */
    providerMappings?: Array<{
      providerConnectionId: string;
      providerName: string;
      providerDisplayName?: string;
      providerType: string;
      externalResourceId: string;
      syncStatus: string;
      lastSyncedAt?: string;
    }>;
  };
}

// ─── Time range ────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h' | '7d';
const RANGE_OPTIONS: { value: TimeRange; label: string; ms: number }[] = [
  { value: '1h',  label: '1h',  ms: 60 * 60 * 1000 },
  { value: '6h',  label: '6h',  ms: 6 * 60 * 60 * 1000 },
  { value: '24h', label: '24h', ms: 24 * 60 * 60 * 1000 },
  { value: '7d',  label: '7d',  ms: 7 * 24 * 60 * 60 * 1000 },
];

function sinceISO(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

// ─── Status thresholds ─────────────────────────────────────────────────────────

type MetricStatus = 'normal' | 'warning' | 'critical' | 'unknown';

function getMetricStatus(value: number | null | undefined): MetricStatus {
  if (value == null) return 'unknown';
  if (value >= 90) return 'critical';
  if (value >= 70) return 'warning';
  return 'normal';
}

const STATUS_STYLE: Record<MetricStatus, { badge: string; dot: string; bar: string; glow: string }> = {
  normal:   { badge: 'bg-emerald-100 text-emerald-700', dot: '#22c55e', bar: '#3b82f6',  glow: 'rgba(59,130,246,0.12)' },
  warning:  { badge: 'bg-amber-100 text-amber-700',     dot: '#f59e0b', bar: '#f59e0b',  glow: 'rgba(245,158,11,0.12)' },
  critical: { badge: 'bg-red-100 text-red-700',         dot: '#ef4444', bar: '#ef4444',  glow: 'rgba(239,68,68,0.12)'  },
  unknown:  { badge: 'bg-slate-100 text-slate-500',     dot: '#94a3b8', bar: '#cbd5e1',  glow: 'rgba(148,163,184,0.08)' },
};

// ─── SVG Chart ────────────────────────────────────────────────────────────────

interface ChartPoint { t: number; v: number; }

function SparkChart({ data, color, height = 80 }: { data: ChartPoint[]; color: string; height?: number }) {
  if (data.length < 2) return null;

  const W = 400; const H = height; const P = 6;
  const ts = data.map(d => d.t); const vs = data.map(d => d.v);
  const tMin = Math.min(...ts); const tMax = Math.max(...ts);
  const vMin = Math.min(...vs); const vMax = Math.max(...vs);
  const tR = tMax - tMin || 1; const vR = vMax - vMin || 1;
  const px = (t: number) => P + ((t - tMin) / tR) * (W - P * 2);
  const py = (v: number) => H - P - ((v - vMin) / vR) * (H - P * 2);
  const pts = data.map(d => `${px(d.t).toFixed(1)},${py(d.v).toFixed(1)}`).join(' ');
  const area = [`${px(data[0].t)},${H}`, ...data.map(d => `${px(d.t).toFixed(1)},${py(d.v).toFixed(1)}`), `${px(data[data.length-1].t)},${H}`].join(' ');
  const lx = px(data[data.length-1].t); const ly = py(data[data.length-1].v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lx} cy={ly} r="4.5" fill={color} stroke="white" strokeWidth="2"/>
    </svg>
  );
}

// ─── Zabbix Style Chart ───────────────────────────────────────────────────────

function ZabbixChart({ data, title, color, unit = '%', domain }: { data: ChartPoint[]; title: string; color: string; unit?: string; domain?: [number, number] }) {
  if (data.length < 2) return null;

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-slate-100 tracking-wide font-mono">{title}</h4>
        <span className="text-xs font-mono text-slate-400">
          Last: <span className="font-bold text-slate-200">{data[data.length - 1].v.toFixed(2)}{unit}</span>
        </span>
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="t" 
              type="number"
              domain={domain || ['dataMin', 'dataMax']}
              tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: 12, borderRadius: 8 }}
              itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
              labelFormatter={(t) => new Date(t as number).toLocaleString()}
              formatter={(val: any) => [`${Number(val).toFixed(2)}${unit}`, title]}
            />
            <Area 
              type="monotone" 
              dataKey="v" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#grad${title.replace(/\s/g, '')})`} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, unit = '%', collectedAt, chartData, color, icon
}: {
  label: string; value: number | null | undefined; unit?: string;
  collectedAt?: string | null; chartData: ChartPoint[];
  color: string; icon: React.ReactNode;
}) {
  const status = getMetricStatus(value);
  const s = STATUS_STYLE[status];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="px-5 pt-5 pb-2">
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.glow }}>
              <span style={{ color }}>{icon}</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
          </div>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${s.badge}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}/>
            {status === 'normal' ? 'Normal' : status === 'warning' ? 'Warning' : status === 'critical' ? 'Critical' : 'No Data'}
          </span>
        </div>

        {/* Value */}
        {value != null ? (
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums">{value.toFixed(2)}</span>
            <span className="text-base text-slate-400 font-medium">{unit}</span>
          </div>
        ) : (
          <div className="text-3xl font-bold text-slate-200 mb-2">—</div>
        )}

        {/* Thin progress */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
          <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min(value ?? 0, 100)}%`, backgroundColor: s.bar }}/>
        </div>

        {collectedAt && (
          <p className="text-[11px] text-slate-400">Updated {new Date(collectedAt).toLocaleTimeString()}</p>
        )}
      </div>

      {/* Sparkline */}
      <div className="px-4 pb-4 pt-1">
        {chartData.length >= 2
          ? <SparkChart data={chartData} color={color} height={64}/>
          : (
            <div className="flex items-center justify-center h-16 gap-1.5 text-slate-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" strokeLinecap="round"/>
                <path d="M7 16l4-4 4 4 4-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[11px]">Collecting history…</span>
            </div>
          )
        }
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function DeviceMetricsDashboard({ deviceId, device }: DeviceMetricsDashboardProps) {
  const [liveMetric, setLiveMetric]     = useState<DeviceMetricResponse | null>(null);
  const [history, setHistory]           = useState<DeviceMetricResponse[]>([]);
  const [range, setRange]               = useState<TimeRange>('1h');
  const [loadingLive, setLoadingLive]   = useState(false);
  const [loadingHist, setLoadingHist]   = useState(false);
  const [liveError, setLiveError]       = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derive monitoring source by providerType === 'MONITORING'
  // Provider-agnostic: does NOT assume position[0] or any specific vendor name
  const monitoringSources: MonitoringSourceInfo[] = (device.providerMappings ?? [])
    .filter(m => m.providerType === 'MONITORING')
    .map(m => ({
      providerName: m.providerName,
      providerDisplayName: m.providerDisplayName,
      syncStatus: m.syncStatus,
      lastSyncedAt: m.lastSyncedAt,
      externalResourceId: m.externalResourceId,
    }));

  // Use first monitoring source for display (there may be multiple in future)
  const primarySource = monitoringSources[0];

  // ── Fetch live ─────────────────────────────────────────────────────────────
  const fetchLive = useCallback(async () => {
    setLoadingLive(true);
    setLiveError(null);
    try {
      const res = await api.get<DeviceMetricResponse>(`/monitoring/devices/${deviceId}/metrics/latest`);
      setLiveMetric(res.data);
    } catch (err: any) {
      setLiveError(err?.response?.data?.message ?? 'Unable to fetch live metrics');
    } finally {
      setLoadingLive(false);
    }
  }, [deviceId]);

  // ── Fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async (r: TimeRange) => {
    setLoadingHist(true);
    try {
      const opt = RANGE_OPTIONS.find(o => o.value === r)!;
      const since = sinceISO(opt.ms);
      const res = await api.get<DeviceMetricResponse | DeviceMetricResponse[]>(
        `/monitoring/devices/${deviceId}/metrics?since=${encodeURIComponent(since)}`
      );
      const arr = Array.isArray(res.data) ? res.data : [res.data];
      setHistory(arr.filter(m => m?.collectedAt));
    } catch {
      setHistory([]);
    } finally {
      setLoadingHist(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchLive]);

  useEffect(() => { fetchHistory(range); }, [range, fetchHistory]);

  // Displayed values: prefer live snapshot, fall back to device prop
  const shown = {
    cpu:  liveMetric?.cpuUsage  ?? device.cpuUsage,
    mem:  liveMetric?.memoryUsage ?? device.memoryUsage,
    disk: liveMetric?.diskUsage ?? device.diskUsage,
    at:   liveMetric?.collectedAt ?? device.lastSeenAt,
    networkIn: liveMetric?.networkIn,
    networkOut: liveMetric?.networkOut,
    uptime: liveMetric?.uptimeSeconds,
  };

  const currentOpt = RANGE_OPTIONS.find(o => o.value === range)!;
  const chartDomain: [number, number] = [Date.now() - currentOpt.ms, Date.now()];

  // Chart data builders
  const toPoints = (f: keyof DeviceMetricResponse): ChartPoint[] =>
    history
      .filter(m => m[f] != null && m.collectedAt)
      .map(m => ({ t: new Date(m.collectedAt!).getTime(), v: m[f] as number }));

  const cpuPoints  = toPoints('cpuUsage');
  const memPoints  = toPoints('memoryUsage');
  const diskPoints = toPoints('diskUsage');
  const netInPoints = toPoints('networkIn');
  const netOutPoints = toPoints('networkOut');

  const fmtUptime = (s?: number | null) => {
    if (!s) return null;
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const fmtBytes = (bytes?: number | null) => {
    if (bytes == null) return null;
    if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB/s`;
    if (bytes > 1024)      return `${(bytes / 1024).toFixed(1)} KB/s`;
    return `${bytes.toFixed(0)} B/s`;
  };

  const IcoCpu = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>;
  const IcoMem = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4v16M10 4v16M14 4v16M18 4v16M3 8h18M3 16h18"/></svg>;
  const IcoDisk = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 5v14a9 3 0 01-18 0V5"/><path d="M3 12a9 3 0 0018 0"/></svg>;

  return (
    <div className="space-y-5">

      {/* ── Provider Info Bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 shadow-sm">
        {primarySource ? (
          <>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Monitoring Source</span>
              <span className="text-xs font-bold text-slate-900 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                {primarySource.providerDisplayName || primarySource.providerName}
              </span>
            </div>

            {primarySource.lastSyncedAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Last sync: <span className="font-medium text-slate-700">{new Date(primarySource.lastSyncedAt).toLocaleString()}</span>
              </div>
            )}

            {monitoringSources.length > 1 && (
              <span className="text-xs text-slate-400">+{monitoringSources.length - 1} more</span>
            )}
          </>
        ) : (
          <span className="text-xs text-slate-400">No monitoring source mapped to this device.</span>
        )}

        <div className="ml-auto flex items-center gap-3">
          {loadingLive && (
            <svg className="animate-spin w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          )}
          <span className="text-[11px] text-slate-400">Auto-refresh 30s</span>
          <button onClick={fetchLive} disabled={loadingLive}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-40 transition-opacity">
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {liveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          Live metrics unavailable: {liveError}
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="CPU Usage"    value={shown.cpu}  collectedAt={shown.at} chartData={cpuPoints}  color="#3b82f6" icon={<IcoCpu/>}/>
        <MetricCard label="Memory Usage" value={shown.mem}  collectedAt={shown.at} chartData={memPoints}  color="#8b5cf6" icon={<IcoMem/>}/>
        <MetricCard label="Disk Usage"   value={shown.disk} collectedAt={shown.at} chartData={diskPoints} color="#f59e0b" icon={<IcoDisk/>}/>
      </div>

      {/* ── Historical Chart ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Historical Trends</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {loadingHist ? 'Loading…' : `${history.length} snapshot${history.length !== 1 ? 's' : ''} in range`}
            </p>
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            {RANGE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setRange(opt.value)} disabled={loadingHist}
                className={`px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                  range === opt.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {loadingHist ? (
            <div className="flex items-center justify-center h-52 gap-2 text-slate-400">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span className="text-sm">Loading history…</span>
            </div>
          ) : history.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-52 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16l4-4 4 4 4-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Historical data is accumulating</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {history.length === 0
                    ? 'No snapshots recorded in the selected time window.'
                    : 'Only 1 snapshot so far — charts need at least 2 data points.'}
                  {' '}The background scheduler saves a new metric snapshot every 30 seconds.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Use <span className="text-blue-600 font-medium">Sync Resources</span> to trigger an immediate snapshot.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {([
                { label: 'CPU Usage',    points: cpuPoints,  color: '#22c55e', unit: '%' },
                { label: 'Memory Usage', points: memPoints,  color: '#3b82f6', unit: '%' },
                { label: 'Disk Usage',   points: diskPoints, color: '#f59e0b', unit: '%' },
                { label: 'Network In',   points: netInPoints, color: '#14b8a6', unit: ' bps' },
                { label: 'Network Out',  points: netOutPoints, color: '#8b5cf6', unit: ' bps' },
              ] as const).map(({ label, points, color, unit }) => points.length >= 2 && (
                <ZabbixChart key={label} data={points} title={label} color={color} unit={unit} domain={chartDomain} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Additional Metrics Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Device Status', value: device.status ?? '—', icon: <span className={`w-2.5 h-2.5 rounded-full inline-block mr-1.5 ${device.status === 'ONLINE' ? 'bg-emerald-400' : device.status === 'OFFLINE' ? 'bg-slate-400' : 'bg-amber-400'}`}/> },
          { label: 'Uptime',        value: fmtUptime(shown.uptime)     ?? 'N/A', icon: null },
          { label: 'Network In',    value: fmtBytes(shown.networkIn)   ?? 'N/A', icon: null },
          { label: 'Network Out',   value: fmtBytes(shown.networkOut)  ?? 'N/A', icon: null },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1.5">{item.label}</p>
            <div className="flex items-center">
              {item.icon}
              <span className={`text-sm font-semibold ${item.value === 'N/A' ? 'text-slate-300' : 'text-slate-800'}`}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Data Freshness Footer ── */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 flex items-start gap-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">Live values</span> are fetched directly from the monitoring provider on page load and every 30 seconds.{' '}
          <span className="font-semibold text-slate-600">Historical snapshots</span> are persisted every 30 seconds by the background scheduler.{' '}
          All values are real — no mock or simulated data is used.
          {primarySource && (
            <> Monitoring provider: <span className="font-semibold">{primarySource.providerDisplayName || primarySource.providerName}</span>.</>
          )}
        </p>
      </div>
    </div>
  );
}
