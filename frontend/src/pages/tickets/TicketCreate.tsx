import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AlertTriangle, X, Loader } from 'lucide-react';

// ============================================================
// Types derived from backend DTOs
// ============================================================
interface Site { id: string; name: string; }
interface Device { id: string; hostname: string; displayName?: string; siteId: string; }
interface Alert { id: string; title: string; severity: string; }
interface ProviderConnection { id: string; providerName: string; displayName?: string; }

// Categories and enums must match the backend TicketCategory, TicketPriority, etc. enums exactly
const TICKET_TYPES = ['INCIDENT', 'SERVICE_REQUEST', 'QUESTION', 'PROBLEM', 'CHANGE'] as const;
const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const TICKET_IMPACTS = ['LOW', 'MEDIUM', 'HIGH'] as const;
const TICKET_CATEGORIES = [
  'NETWORK', 'SERVER', 'ENDPOINT', 'SECURITY', 'BACKUP', 'SOFTWARE', 'HARDWARE', 'ACCESS', 'OTHER'
] as const;

type TicketType = typeof TICKET_TYPES[number];
type TicketPriority = typeof TICKET_PRIORITIES[number];
type TicketImpact = typeof TICKET_IMPACTS[number];
type TicketCategory = typeof TICKET_CATEGORIES[number];

interface FormData {
  title: string;
  description: string;
  type: TicketType | '';
  priority: TicketPriority;
  impact: TicketImpact | '';
  category: TicketCategory;
  subcategory: string;
  assignmentGroup: string;
  siteId: string;
  deviceId: string;
  relatedAlertId: string;
  providerConnectionId: string;
}

// ============================================================
// Helpers
// ============================================================
const labelFor = (val: string) =>
  val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const PriorityBadge = ({ priority }: { priority: TicketPriority | '' }) => {
  const colors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };
  if (!priority) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[priority] ?? ''}`}>
      {priority}
    </span>
  );
};

// ============================================================
// Section card wrapper
// ============================================================
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

// ============================================================
// Field components
// ============================================================
const Field = ({
  label, required, children, note,
}: {
  label: string; required?: boolean; children: React.ReactNode; note?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
  </div>
);

const inputCls =
  'block w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 placeholder-slate-400';
const selectCls = `${inputCls} bg-white`;

// ============================================================
// Main component
// ============================================================
const TicketCreate = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isPlatformUser = role === 'ROLE_PLATFORM_ADMIN' || role === 'ROLE_PLATFORM_TECH';

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: '',
    priority: 'MEDIUM',
    impact: '',
    category: 'NETWORK',
    subcategory: '',
    assignmentGroup: '',
    siteId: '',
    deviceId: '',
    relatedAlertId: '',
    providerConnectionId: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Real data from backend APIs — never static arrays
  const [sites, setSites] = useState<Site[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [providers, setProviders] = useState<ProviderConnection[]>([]);

  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const [siteError, setSiteError] = useState('');
  const [alertError, setAlertError] = useState('');
  const [providerError, setProviderError] = useState('');

  // Fetch sites on mount
  useEffect(() => {
    setLoadingSites(true);
    api.get('/monitoring/sites')
      .then(res => setSites(res.data || []))
      .catch(() => setSiteError('Could not load sites'))
      .finally(() => setLoadingSites(false));
  }, []);

  // Fetch devices when a site is selected
  useEffect(() => {
    if (!formData.siteId) {
      setDevices([]);
      return;
    }
    setLoadingDevices(true);
    api.get('/monitoring/devices', { params: { siteId: formData.siteId } })
      .then(res => setDevices((res.data?.content || res.data || []).filter((d: Device) => d.siteId === formData.siteId)))
      .catch(() => setDevices([]))
      .finally(() => setLoadingDevices(false));
  }, [formData.siteId]);

  // Fetch alerts on mount
  useEffect(() => {
    api.get('/monitoring/alerts', { params: { size: 100 } })
      .then(res => setAlerts(res.data?.content || res.data || []))
      .catch(() => setAlertError('Could not load alerts'))
      .finally(() => setLoadingAlerts(false));
  }, []);

  // Fetch providers on mount
  useEffect(() => {
    api.get('/providers')
      .then(res => setProviders(res.data?.content || res.data || []))
      .catch(() => setProviderError('Could not load providers'))
      .finally(() => setLoadingProviders(false));
  }, []);

  const set = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Clear deviceId if siteId changes
      if (field === 'siteId') next.deviceId = '';
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body: Record<string, unknown> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      category: formData.category,
    };
    if (formData.type) body.type = formData.type;
    if (formData.impact) body.impact = formData.impact;
    if (formData.subcategory) body.subcategory = formData.subcategory;
    if (formData.assignmentGroup) body.assignmentGroup = formData.assignmentGroup;
    if (formData.siteId) body.siteId = formData.siteId;
    if (formData.deviceId) body.deviceId = formData.deviceId;
    if (formData.relatedAlertId) body.relatedAlertId = formData.relatedAlertId;
    if (formData.providerConnectionId) body.providerConnectionId = formData.providerConnectionId;

    try {
      const res = await api.post('/tickets', body);
      navigate(`/tickets/${res.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || 'Failed to create ticket. Check the form and try again.';
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Ticket</h1>
          <p className="text-sm text-slate-500 mt-0.5">All fields marked * are required</p>
        </div>
        <Link
          to="/tickets"
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4" /> Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ─── Ticket Information ─── */}
        <Section title="Ticket Information">
          <Field label="Title" required>
            <input
              type="text"
              className={inputCls}
              placeholder="Brief, descriptive title"
              value={formData.title}
              onChange={e => set('title', e.target.value)}
              required
              maxLength={255}
            />
          </Field>

          <Field label="Description" required>
            <textarea
              className={inputCls}
              rows={4}
              placeholder="Describe the issue, request, or question in detail..."
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <select className={selectCls} value={formData.type} onChange={e => set('type', e.target.value)}>
                <option value="">— Select Type —</option>
                {TICKET_TYPES.map(t => (
                  <option key={t} value={t}>{labelFor(t)}</option>
                ))}
              </select>
            </Field>
            <Field label="Category" required>
              <select className={selectCls} value={formData.category} onChange={e => set('category', e.target.value)} required>
                {TICKET_CATEGORIES.map(c => (
                  <option key={c} value={c}>{labelFor(c)}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Subcategory">
            <input
              type="text"
              className={inputCls}
              placeholder="Optional subcategory"
              value={formData.subcategory}
              onChange={e => set('subcategory', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority" required>
              <div className="flex items-center gap-2">
                <select
                  className={`${selectCls} flex-1`}
                  value={formData.priority}
                  onChange={e => set('priority', e.target.value as TicketPriority)}
                  required
                >
                  {TICKET_PRIORITIES.map(p => (
                    <option key={p} value={p}>{labelFor(p)}</option>
                  ))}
                </select>
                <PriorityBadge priority={formData.priority} />
              </div>
            </Field>
            <Field label="Impact">
              <select className={selectCls} value={formData.impact} onChange={e => set('impact', e.target.value)}>
                <option value="">— Select Impact —</option>
                {TICKET_IMPACTS.map(i => (
                  <option key={i} value={i}>{labelFor(i)}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* ─── Customer Context ─── */}
        <Section title="Customer Context">
          <Field
            label="Site"
            note={siteError || (sites.length === 0 && !loadingSites ? 'No sites available for your account' : undefined)}
          >
            {loadingSites ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader className="w-4 h-4 animate-spin" /> Loading sites…
              </div>
            ) : (
              <select
                className={selectCls}
                value={formData.siteId}
                onChange={e => set('siteId', e.target.value)}
              >
                <option value="">— None / Not applicable —</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </Field>

          <Field
            label="Affected Device / Asset"
            note={!formData.siteId ? 'Select a site first to filter devices' : undefined}
          >
            {formData.siteId && loadingDevices ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader className="w-4 h-4 animate-spin" /> Loading devices…
              </div>
            ) : (
              <select
                className={selectCls}
                value={formData.deviceId}
                onChange={e => set('deviceId', e.target.value)}
                disabled={!formData.siteId}
              >
                <option value="">— None —</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.displayName || d.hostname}</option>
                ))}
                {formData.siteId && devices.length === 0 && !loadingDevices && (
                  <option disabled value="">No devices in this site</option>
                )}
              </select>
            )}
          </Field>
        </Section>

        {/* ─── Assignment ─── */}
        {isPlatformUser && (
          <Section title="Assignment">
            <Field label="Assignment Group" note="Name of the team or group responsible for this ticket">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Network Operations, Security Response"
                value={formData.assignmentGroup}
                onChange={e => set('assignmentGroup', e.target.value)}
              />
            </Field>
          </Section>
        )}

        {/* ─── Related Resources ─── */}
        <Section title="Related Resources">
          <Field
            label="Related Alert"
            note={alertError || undefined}
          >
            {loadingAlerts ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader className="w-4 h-4 animate-spin" /> Loading alerts…
              </div>
            ) : (
              <select
                className={selectCls}
                value={formData.relatedAlertId}
                onChange={e => set('relatedAlertId', e.target.value)}
              >
                <option value="">— Not linked —</option>
                {alerts.map(a => (
                  <option key={a.id} value={a.id}>[{a.severity}] {a.title}</option>
                ))}
                {alerts.length === 0 && <option disabled value="">No active alerts</option>}
              </select>
            )}
          </Field>

          <Field
            label="Provider Connection (Source)"
            note={providerError || undefined}
          >
            {loadingProviders ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader className="w-4 h-4 animate-spin" /> Loading providers…
              </div>
            ) : (
              <select
                className={selectCls}
                value={formData.providerConnectionId}
                onChange={e => set('providerConnectionId', e.target.value)}
              >
                <option value="">— Manual / Not linked —</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.displayName || p.providerName}</option>
                ))}
                {providers.length === 0 && <option disabled value="">No provider connections configured</option>}
              </select>
            )}
          </Field>
        </Section>

        {/* ─── SLA ─── */}
        <Section title="SLA Policy">
          <div className="flex items-center gap-2 py-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
              NOT_AVAILABLE
            </span>
            <span className="text-sm text-slate-400">
              SLA Policy infrastructure is not yet configured. Tickets will be tracked without SLA enforcement.
            </span>
          </div>
        </Section>

        {/* ─── Actions ─── */}
        <div className="flex justify-end gap-3 pt-2 pb-6">
          <Link
            to="/tickets"
            className="bg-white py-2 px-5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-900 text-white py-2 px-5 rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            {saving ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreate;

