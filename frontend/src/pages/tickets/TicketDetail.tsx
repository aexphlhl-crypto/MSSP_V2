import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  ArrowLeft, Clock, User, Building2, Server,
  ShieldAlert, ChevronDown, Send, Lock, MessageSquare,
  History, CheckCircle, AlertTriangle, XCircle, Circle,
  Loader, RefreshCw
} from 'lucide-react';

// =========================================================
// Types
// =========================================================
interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  source: string;
  type?: string;
  subcategory?: string;
  impact?: string;
  assignmentGroup?: string;
  requesterId?: string;
  assigneeId?: string;
  siteId?: string;
  deviceId?: string;
  relatedIncidentId?: string;
  relatedAlertId?: string;
  providerConnectionId?: string;
  responseDueAt?: string;
  resolutionDueAt?: string;
  responseSlaBreached?: boolean;
  resolutionSlaBreached?: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  internal: boolean;
  createdAt: string;
}

interface HistoryEntry {
  id: string;
  ticketId: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  actorId: string;
  createdAt: string;
}

// =========================================================
// Helpers
// =========================================================
const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  OPEN:              { color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: <Circle className="w-3.5 h-3.5" />,      label: 'Open' },
  IN_PROGRESS:       { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'In Progress' },
  PENDING_CUSTOMER:  { color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: <Clock className="w-3.5 h-3.5" />,      label: 'Pending Customer' },
  PENDING_VENDOR:    { color: 'bg-orange-100 text-orange-700 border-orange-200',icon: <Clock className="w-3.5 h-3.5" />,      label: 'Pending Vendor' },
  RESOLVED:          { color: 'bg-green-100 text-green-700 border-green-200',   icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Resolved' },
  CLOSED:            { color: 'bg-slate-100 text-slate-600 border-slate-200',   icon: <XCircle className="w-3.5 h-3.5" />,    label: 'Closed' },
  CANCELLED:         { color: 'bg-red-100 text-red-600 border-red-200',         icon: <XCircle className="w-3.5 h-3.5" />,    label: 'Cancelled' },
};

const PRIORITY_CONFIG: Record<string, string> = {
  LOW:      'bg-slate-100 text-slate-600',
  MEDIUM:   'bg-blue-100 text-blue-700',
  HIGH:     'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700 font-bold',
};

const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_VENDOR', 'RESOLVED', 'CLOSED', 'CANCELLED'];

const fmtDate = (iso: string) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
};

const fmtDateShort = (iso: string) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
};

const actionLabel = (entry: HistoryEntry) => {
  const map: Record<string, string> = {
    TICKET_CREATED: 'Ticket created',
    STATUS_CHANGED: `Status changed ${entry.oldValue} → ${entry.newValue}`,
    PRIORITY_CHANGED: `Priority changed ${entry.oldValue} → ${entry.newValue}`,
    TYPE_CHANGED: `Type changed ${entry.oldValue ?? 'None'} → ${entry.newValue}`,
    IMPACT_CHANGED: `Impact changed ${entry.oldValue ?? 'None'} → ${entry.newValue}`,
    CATEGORY_CHANGED: `Category changed ${entry.oldValue} → ${entry.newValue}`,
    ASSIGNED: `Assigned to ${entry.newValue ?? 'none'} (was ${entry.oldValue ?? 'none'})`,
    ASSIGNMENT_GROUP_CHANGED: `Assignment group changed to ${entry.newValue ?? 'none'}`,
    SITE_CHANGED: `Site linked`,
    DEVICE_CHANGED: `Device linked`,
    ALERT_LINKED: `Alert linked`,
    INCIDENT_LINKED: `Incident linked`,
    PROVIDER_LINKED: `Provider connection linked`,
    PUBLIC_COMMENT_ADDED: 'Public comment added',
    INTERNAL_NOTE_ADDED: 'Internal note added',
    COMMENT_ADDED: 'Comment added',
    FIELD_CHANGED: `${entry.fieldName ?? 'Field'} updated`,
  };
  return map[entry.action] || entry.action.replace(/_/g, ' ').toLowerCase();
};

// =========================================================
// Sub-components
// =========================================================
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Circle className="w-3.5 h-3.5" />, label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => (
  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${PRIORITY_CONFIG[priority] ?? 'bg-gray-100 text-gray-600'}`}>
    {priority}
  </span>
);

const PropRow = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col ${className ?? ''}`}>
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm text-slate-700 mt-0.5 break-words">{value || <span className="text-slate-400 italic">—</span>}</span>
  </div>
);

// =========================================================
// Main component
// =========================================================
const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const { role } = useAuthStore();
  const isPlatformUser = role === 'ROLE_PLATFORM_ADMIN' || role === 'ROLE_PLATFORM_TECH';

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Status change
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      const [ticketRes, commentsRes, historyRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
        api.get(`/tickets/${id}/history`),
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Ticket not found.' : 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || newStatus === ticket.status) return;
    setChangingStatus(true);
    setStatusError('');
    setShowStatusMenu(false);
    try {
      const res = await api.patch(`/tickets/${id}/status`, { status: newStatus });
      setTicket(res.data);
      // Refresh history
      const hRes = await api.get(`/tickets/${id}/history`);
      setHistory(hRes.data || []);
    } catch (err: any) {
      setStatusError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setCommentError('');
    try {
      const res = await api.post(`/tickets/${id}/comments`, {
        content: newComment,
        internal: isInternal,
      });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      setIsInternal(false);
      // Refresh history for audit trail
      const hRes = await api.get(`/tickets/${id}/history`);
      setHistory(hRes.data || []);
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  );

  if (error || !ticket) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
      <AlertTriangle className="w-10 h-10 text-amber-400" />
      <p className="text-lg font-medium">{error || 'Ticket not found'}</p>
      <Link to="/tickets" className="text-sm text-blue-600 hover:underline">← Back to Tickets</Link>
    </div>
  );

  const availableStatuses = VALID_STATUSES.filter(s => s !== ticket.status);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <Link
            to="/tickets"
            className="mt-1 p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-slate-400">{ticket.ticketNumber}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.impact && (
                <span className="text-xs text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">
                  Impact: {ticket.impact}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-800">{ticket.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Opened {fmtDate(ticket.createdAt)}
              {ticket.requesterId && ` by ${ticket.requesterId}`}
            </p>
          </div>
        </div>

        {/* Status Action */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowStatusMenu(v => !v)}
            disabled={changingStatus}
            className="flex items-center gap-2 border border-slate-300 bg-white rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {changingStatus ? <Loader className="w-4 h-4 animate-spin" /> : null}
            Change Status <ChevronDown className="w-4 h-4" />
          </button>
          {showStatusMenu && (
            <div className="absolute right-0 top-10 z-10 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[180px] overflow-hidden">
              {availableStatuses.map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    {cfg?.icon}
                    <span>{cfg?.label ?? s}</span>
                  </button>
                );
              })}
            </div>
          )}
          {statusError && (
            <p className="absolute right-0 top-12 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 mt-2 whitespace-nowrap">
              {statusError}
            </p>
          )}
        </div>
      </div>

      {/* ── Body: 2-column layout ── */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* ── Main: Conversation + History ── */}
        <div className="flex-1 flex flex-col min-w-0 space-y-4">
          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>

          {/* Conversation */}
          <div className="bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">
                Conversation
                {comments.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">({comments.length})</span>
                )}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-80">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No comments yet. Be the first to reply.</p>
              ) : (
                comments.map(comment => (
                  <div
                    key={comment.id}
                    className={`rounded-lg border p-4 ${
                      comment.internal
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{comment.authorId}</span>
                        {comment.internal && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            <Lock className="w-3 h-3" /> Internal
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{fmtDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply form */}
            <div className="border-t border-slate-100 p-4 bg-slate-50">
              {isPlatformUser && (
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setIsInternal(false)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium border transition-colors ${
                      !isInternal
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" /> Public Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternal(true)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium border transition-colors ${
                      isInternal
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Lock className="w-3 h-3" /> Internal Note
                  </button>
                </div>
              )}
              <form onSubmit={handleAddComment}>
                <textarea
                  rows={3}
                  className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                    isInternal ? 'border-amber-300 bg-amber-50' : 'border-slate-300 bg-white'
                  }`}
                  placeholder={isInternal ? 'Internal note (staff only)…' : 'Write a reply…'}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={submitting}
                />
                {commentError && (
                  <p className="text-xs text-red-600 mt-1">{commentError}</p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors ${
                      isInternal
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Posting…' : isInternal ? 'Add Note' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">Activity History</h3>
            </div>
            <div className="p-5 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No activity recorded.</p>
              ) : (
                <ol className="relative border-l border-slate-200 ml-3 space-y-5">
                  {history.map(entry => (
                    <li key={entry.id} className="ml-5">
                      <div className="absolute -left-1.5 w-3 h-3 bg-slate-300 rounded-full border border-white"></div>
                      <span className="text-xs text-slate-400 block">{fmtDate(entry.createdAt)}</span>
                      <p className="text-sm text-slate-700 mt-0.5">
                        <span className="font-medium">{entry.actorId}</span>{' '}
                        {actionLabel(entry)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar: Properties ── */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Ticket Properties */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Properties</h3>
            </div>
            <div className="p-4 space-y-4 divide-y divide-slate-100">
              <div className="space-y-3">
                <PropRow label="Status" value={<StatusBadge status={ticket.status} />} />
                <PropRow label="Priority" value={<PriorityBadge priority={ticket.priority} />} />
                <PropRow label="Impact" value={ticket.impact || <span className="text-slate-400 italic text-xs">Not set</span>} />
              </div>
              <div className="pt-3 space-y-3">
                <PropRow label="Type" value={ticket.type ? ticket.type.replace(/_/g, ' ') : undefined} />
                <PropRow label="Category" value={ticket.category} />
                <PropRow label="Subcategory" value={ticket.subcategory} />
              </div>
              <div className="pt-3 space-y-3">
                <PropRow label="Source" value={ticket.source} />
                <PropRow
                  label="Provider"
                  value={
                    ticket.providerConnectionId
                      ? <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{ticket.providerConnectionId.substring(0, 8)}…</span>
                      : <span className="text-slate-400 italic text-xs">Manual</span>
                  }
                />
              </div>
            </div>
          </div>

          {/* Customer Context */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Context</h3>
            </div>
            <div className="p-4 space-y-3">
              <PropRow
                label="Site"
                value={
                  ticket.siteId
                    ? <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {ticket.siteId.substring(0, 8)}…</span>
                    : undefined
                }
              />
              <PropRow
                label="Affected Device"
                value={
                  ticket.deviceId
                    ? <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5 text-slate-400" /> {ticket.deviceId.substring(0, 8)}…</span>
                    : undefined
                }
              />
              <PropRow
                label="Related Alert"
                value={
                  ticket.relatedAlertId
                    ? <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> {ticket.relatedAlertId.substring(0, 8)}…</span>
                    : undefined
                }
              />
              <PropRow
                label="Related Incident"
                value={
                  ticket.relatedIncidentId
                    ? <span className="flex items-center gap-1 text-xs font-mono">{ticket.relatedIncidentId.substring(0, 8)}…</span>
                    : undefined
                }
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignment</h3>
            </div>
            <div className="p-4 space-y-3">
              <PropRow
                label="Requester"
                value={
                  ticket.requesterId
                    ? <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> {ticket.requesterId}</span>
                    : undefined
                }
              />
              <PropRow
                label="Assignee"
                value={
                  ticket.assigneeId
                    ? <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-blue-500" /> {ticket.assigneeId}</span>
                    : <span className="text-slate-400 italic text-xs">Unassigned</span>
                }
              />
              <PropRow label="Assignment Group" value={ticket.assignmentGroup} />
            </div>
          </div>

          {/* SLA */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA</h3>
            </div>
            <div className="p-4 space-y-3">
              {ticket.responseDueAt ? (
                <>
                  <PropRow
                    label="Response Due"
                    value={
                      <span className={ticket.responseSlaBreached ? 'text-red-600 font-semibold' : ''}>
                        {fmtDate(ticket.responseDueAt)}
                        {ticket.responseSlaBreached && ' ⚠ BREACHED'}
                      </span>
                    }
                  />
                  <PropRow
                    label="Resolution Due"
                    value={
                      ticket.resolutionDueAt
                        ? <span className={ticket.resolutionSlaBreached ? 'text-red-600 font-semibold' : ''}>
                            {fmtDate(ticket.resolutionDueAt)}
                            {ticket.resolutionSlaBreached && ' ⚠ BREACHED'}
                          </span>
                        : undefined
                    }
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                    NOT_AVAILABLE
                  </span>
                  <span className="text-xs text-slate-400">No SLA configured</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</h3>
            </div>
            <div className="p-4 space-y-3">
              <PropRow label="Created" value={fmtDate(ticket.createdAt)} />
              <PropRow label="Updated" value={fmtDate(ticket.updatedAt)} />
              {ticket.resolvedAt && <PropRow label="Resolved" value={fmtDate(ticket.resolvedAt)} />}
              {ticket.closedAt && <PropRow label="Closed" value={fmtDate(ticket.closedAt)} />}
            </div>
          </div>
        </div>
      </div>

      {/* Close menu on outside click */}
      {showStatusMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowStatusMenu(false)} />
      )}
    </div>
  );
};

export default TicketDetail;

