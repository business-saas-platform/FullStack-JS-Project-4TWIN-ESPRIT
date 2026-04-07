import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useBusinessContext } from '@/shared/contexts/BusinessContext';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_BASE.replace('/api', '');
const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const ADMIN_ROLES = ['platform_admin', 'business_owner', 'business_admin'];

interface Channel { id: string; name: string; type: string; isDefault: boolean; memberIds: string[]; }
interface Message { id: string; senderId: string; senderName: string; content: string; createdAt: string; type: string; }
interface Peer { userId: string; userName: string; stream?: MediaStream; }
interface TeamMember { id: string; name: string; email: string; role: string; status?: string; joinedAt?: string; permissions?: string[]; }
interface Meeting { id: string; callId: string; channelName: string; startedAt: string; endedAt?: string; duration?: number; participants: string[]; type: 'video' | 'audio'; }

// ── Helpers ───────────────────────────────────────────────
function nameColor(name: string) {
  const p = ['#6264A7','#0078D4','#038387','#498205','#C43E1C','#8764B8','#00B7C3','#4F6BED'];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
}

function Av({ name, size = 32, online }: { name: string; size?: number; online?: boolean }) {
  const bg = nameColor(name);
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold select-none"
        style={{ background: bg, fontSize: size * 0.38 }}>{initials}</div>
      {online !== undefined && (
        <div className="absolute bottom-0 right-0 rounded-full border-2 border-white"
          style={{ width: size * 0.3, height: size * 0.3, background: online ? '#6BB700' : '#8A8886' }} />
      )}
    </div>
  );
}

function VideoTile({ stream, name, muted = false, isScreen }: { stream: MediaStream | null; name: string; muted?: boolean; isScreen?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  return (
    <div className="relative rounded-lg overflow-hidden bg-[#201F1E] flex items-center justify-center group"
      style={{ aspectRatio: '16/9', border: '1px solid rgba(255,255,255,0.1)' }}>
      {stream ? <video ref={ref} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
        : <div className="flex flex-col items-center gap-2"><Av name={name} size={52} /><span className="text-white/60 text-xs">{name}</span></div>}
      {isScreen && <div className="absolute top-2 left-2 bg-[#6264A7] text-white text-[10px] px-2 py-0.5 rounded font-medium">Presenting</div>}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(transparent,rgba(0,0,0,0.7))' }}>
        <span className="text-white text-xs font-medium">{name}{muted ? ' (You)' : ''}</span>
      </div>
    </div>
  );
}

function fmtTime(d: string) {
  const now = new Date(); const dt = new Date(d);
  return now.toDateString() === dt.toDateString()
    ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function fmtDuration(secs: number) {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

// ── New Channel Modal ─────────────────────────────────────
function NewChannelModal({ onClose, onCreate, members }: {
  onClose: () => void;
  onCreate: (name: string, type: 'public' | 'private', memberIds: string[]) => Promise<void>;
  members: TeamMember[];
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try { await onCreate(name, type, selected); onClose(); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ border: '1px solid #E1DFDD' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E1DFDD' }}>
          <h3 className="font-semibold text-base" style={{ color: '#201F1E' }}>Create a channel</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#8A8886' }}>Channel name</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ border: '1px solid #E1DFDD' }}>
              <span className="text-gray-400 font-medium">#</span>
              <input className="flex-1 outline-none text-sm" style={{ color: '#201F1E' }}
                placeholder="e.g. project-alpha" value={name}
                onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} autoFocus />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#8A8886' }}>Privacy</label>
            <div className="grid grid-cols-2 gap-2">
              {(['public', 'private'] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ border: `1px solid ${type === t ? '#6264A7' : '#E1DFDD'}`, background: type === t ? 'rgba(98,100,167,0.06)' : 'white', color: type === t ? '#6264A7' : '#605E5C' }}>
                  <span>{t === 'public' ? '🌐' : '🔒'}</span><span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#8A8886' }}>
              {type === 'public' ? 'Everyone in your organization can join.' : 'Only invited members can access this channel.'}
            </p>
          </div>
          {type === 'private' && (
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#8A8886' }}>Invite members</label>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #E1DFDD', maxHeight: 180, overflowY: 'auto' }}>
                {members.map(m => (
                  <label key={m.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} style={{ accentColor: '#6264A7' }} />
                    <Av name={m.name} size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#201F1E' }}>{m.name}</p>
                      <p className="text-[11px] capitalize truncate" style={{ color: '#8A8886' }}>{m.role.replace(/_/g, ' ')}</p>
                    </div>
                  </label>
                ))}
              </div>
              {selected.length > 0 && <p className="text-xs mt-1.5" style={{ color: '#6264A7' }}>{selected.length} member{selected.length > 1 ? 's' : ''} selected</p>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: '#E1DFDD', background: '#FAFAFA' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#6264A7' }}>{loading ? 'Creating...' : 'Create channel'}</button>
        </div>
      </div>
    </div>
  );
}

// ── TEAMS TAB ─────────────────────────────────────────────
function TeamsTab({ members, onlineIds, user }: { members: TeamMember[]; onlineIds: string[]; user: any }) {
  const [view, setView] = useState<'list' | 'org'>('list');
  const [search, setSearch] = useState('');

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleGroups = filtered.reduce<Record<string, TeamMember[]>>((acc, m) => {
    const role = m.role.replace(/_/g, ' ');
    if (!acc[role]) acc[role] = [];
    acc[role].push(m);
    return acc;
  }, {});

  const roleOrder = ['business owner', 'business admin', 'accountant', 'team member', 'client'];
  const sortedRoles = Object.keys(roleGroups).sort((a, b) => {
    const ai = roleOrder.indexOf(a); const bi = roleOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const roleColors: Record<string, string> = {
    'business owner': '#6264A7', 'business admin': '#0078D4',
    'accountant': '#038387', 'team member': '#498205', 'client': '#C43E1C',
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F5F5' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b bg-white" style={{ borderColor: '#E1DFDD' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-base" style={{ color: '#201F1E' }}>Team Members</h2>
            <p className="text-xs" style={{ color: '#8A8886' }}>{members.length} members · {onlineIds.length} online</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('list')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: view === 'list' ? '#6264A7' : 'transparent', color: view === 'list' ? 'white' : '#8A8886', border: '1px solid #E1DFDD' }}>
              List
            </button>
            <button onClick={() => setView('org')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: view === 'org' ? '#6264A7' : 'transparent', color: view === 'org' ? 'white' : '#8A8886', border: '1px solid #E1DFDD' }}>
              Org Chart
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white" style={{ border: '1px solid #E1DFDD' }}>
          <span className="text-gray-400">🔍</span>
          <input className="flex-1 text-sm outline-none placeholder-gray-400" style={{ color: '#201F1E' }}
            placeholder="Search by name, email or role..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>}
        </div>
      </div>

      <div className="p-6">
        {view === 'list' ? (
          // LIST VIEW — grouped by role
          <div className="space-y-6">
            {sortedRoles.map(role => (
              <div key={role}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1" style={{ background: '#E1DFDD' }} />
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold capitalize"
                    style={{ background: `${roleColors[role] || '#6264A7'}15`, color: roleColors[role] || '#6264A7' }}>
                    {role} · {roleGroups[role].length}
                  </span>
                  <div className="h-px flex-1" style={{ background: '#E1DFDD' }} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {roleGroups[role].map(m => {
                    const isOnline = onlineIds.includes(m.id);
                    const isMe = m.id === user?.id;
                    return (
                      <div key={m.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-4 transition-all hover:shadow-sm"
                        style={{ border: '1px solid #F0F0F0' }}>
                        <Av name={m.name} size={42} online={isOnline} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm" style={{ color: '#201F1E' }}>
                              {m.name}{isMe ? ' (You)' : ''}
                            </p>
                            {isOnline && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{ background: 'rgba(107,183,0,0.1)', color: '#6BB700' }}>Online</span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5 truncate" style={{ color: '#8A8886' }}>{m.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[11px] px-2 py-1 rounded-lg capitalize font-medium"
                            style={{ background: `${roleColors[role] || '#6264A7'}12`, color: roleColors[role] || '#6264A7' }}>
                            {role}
                          </span>
                          {m.joinedAt && (
                            <p className="text-[10px] mt-1" style={{ color: '#8A8886' }}>
                              Joined {new Date(m.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-sm" style={{ color: '#8A8886' }}>No members match your search</p>
              </div>
            )}
          </div>
        ) : (
          // ORG CHART VIEW
          <div className="flex flex-col items-center gap-6">
            {sortedRoles.slice(0, 1).map(role => (
              <div key={role} className="flex flex-col items-center">
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-3 py-1 rounded-full"
                  style={{ background: `${roleColors[role]}15`, color: roleColors[role] }}>
                  {role}
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {roleGroups[role].map(m => (
                    <OrgCard key={m.id} member={m} online={onlineIds.includes(m.id)} color={roleColors[role] || '#6264A7'} />
                  ))}
                </div>
              </div>
            ))}
            {sortedRoles.length > 1 && (
              <>
                <div className="w-px h-8" style={{ background: '#E1DFDD' }} />
                <div className="flex flex-wrap justify-center gap-6">
                  {sortedRoles.slice(1).map(role => (
                    <div key={role} className="flex flex-col items-center gap-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ background: `${roleColors[role] || '#6264A7'}15`, color: roleColors[role] || '#6264A7' }}>
                        {role}
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {roleGroups[role].map(m => (
                          <OrgCard key={m.id} member={m} online={onlineIds.includes(m.id)} color={roleColors[role] || '#6264A7'} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {members.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <div className="text-4xl mb-3">🏢</div>
                <p className="text-sm" style={{ color: '#8A8886' }}>No team members yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrgCard({ member, online, color }: { member: TeamMember; online: boolean; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 w-32 text-center transition-all hover:shadow-md"
      style={{ border: `1px solid ${color}25`, boxShadow: `0 2px 8px ${color}10` }}>
      <Av name={member.name} size={44} online={online} />
      <div>
        <p className="text-xs font-semibold leading-tight" style={{ color: '#201F1E' }}>{member.name}</p>
        <p className="text-[10px] mt-0.5 capitalize" style={{ color: '#8A8886' }}>{member.role.replace(/_/g, ' ')}</p>
      </div>
      <div className="w-full h-0.5 rounded-full" style={{ background: `${color}30` }} />
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: online ? '#6BB700' : '#8A8886' }} />
        <span className="text-[9px]" style={{ color: '#8A8886' }}>{online ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  );
}

// ── CALENDAR TAB ──────────────────────────────────────────
function CalendarTab({ meetings, onStartMeeting }: { meetings: Meeting[]; onStartMeeting: () => void }) {
  const [viewMonth, setViewMonth] = useState(new Date());

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const meetingsByDate = meetings.reduce<Record<string, Meeting[]>>((acc, m) => {
    const key = new Date(m.startedAt).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  const monthName = viewMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const upcomingMeetings = meetings
    .filter(m => !m.endedAt)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  const pastMeetings = meetings
    .filter(m => m.endedAt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 10);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F5F5' }}>
      <div className="sticky top-0 z-10 px-6 py-4 border-b bg-white" style={{ borderColor: '#E1DFDD' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base" style={{ color: '#201F1E' }}>Calendar</h2>
            <p className="text-xs" style={{ color: '#8A8886' }}>Meeting history & schedule</p>
          </div>
          <button onClick={onStartMeeting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#6264A7' }}>
            <span>📹</span> New Meeting
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Calendar grid */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E1DFDD' }}>
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E1DFDD' }}>
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">‹</button>
            <h3 className="font-semibold text-sm" style={{ color: '#201F1E' }}>{monthName}</h3>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: '#E1DFDD' }}>
            {days.map(d => (
              <div key={d} className="py-2 text-center text-[11px] font-semibold" style={{ color: '#8A8886' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 border-b border-r" style={{ borderColor: '#F0F0F0' }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isToday = date.toDateString() === today.toDateString();
              const dayMeetings = meetingsByDate[date.toDateString()] ?? [];
              return (
                <div key={day} className="h-14 border-b border-r p-1 flex flex-col"
                  style={{ borderColor: '#F0F0F0', background: isToday ? 'rgba(98,100,167,0.04)' : 'white' }}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-0.5 ${isToday ? 'text-white' : ''}`}
                    style={{ background: isToday ? '#6264A7' : 'transparent', color: isToday ? 'white' : '#201F1E' }}>
                    {day}
                  </div>
                  {dayMeetings.slice(0, 2).map((m, mi) => (
                    <div key={mi} className="text-[9px] px-1 py-0.5 rounded truncate font-medium"
                      style={{ background: m.type === 'video' ? 'rgba(98,100,167,0.15)' : 'rgba(3,131,135,0.15)', color: m.type === 'video' ? '#6264A7' : '#038387' }}>
                      {m.type === 'video' ? '📹' : '📞'} {m.channelName}
                    </div>
                  ))}
                  {dayMeetings.length > 2 && <span className="text-[9px]" style={{ color: '#8A8886' }}>+{dayMeetings.length - 2}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel: upcoming + history */}
        <div className="space-y-4">
          {/* Upcoming / active meetings */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E1DFDD' }}>
            <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: '#E1DFDD' }}>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="font-semibold text-sm" style={{ color: '#201F1E' }}>Active Meetings</h3>
            </div>
            {upcomingMeetings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm" style={{ color: '#8A8886' }}>No active meetings</p>
                <button onClick={onStartMeeting}
                  className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                  style={{ background: '#6264A7' }}>Start one now</button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#F0F0F0' }}>
                {upcomingMeetings.map(m => (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(98,100,167,0.1)' }}>
                      <span>{m.type === 'video' ? '📹' : '📞'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#201F1E' }}>#{m.channelName}</p>
                      <p className="text-[11px]" style={{ color: '#8A8886' }}>
                        Started {fmtTime(m.startedAt)} · {m.participants.length} participant{m.participants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                      style={{ background: 'rgba(196,62,28,0.1)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-red-600">LIVE</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past meetings */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E1DFDD' }}>
            <div className="px-5 py-3.5 border-b" style={{ borderColor: '#E1DFDD' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#201F1E' }}>Recent Meetings</h3>
            </div>
            {pastMeetings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={{ color: '#8A8886' }}>No past meetings yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#F0F0F0' }}>
                {pastMeetings.map(m => (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,0,0,0.04)' }}>
                      <span className="text-gray-400">{m.type === 'video' ? '📹' : '📞'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#201F1E' }}>#{m.channelName}</p>
                      <p className="text-[11px]" style={{ color: '#8A8886' }}>
                        {new Date(m.startedAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}{fmtTime(m.startedAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {m.duration && (
                        <p className="text-xs font-medium" style={{ color: '#6264A7' }}>{fmtDuration(m.duration)}</p>
                      )}
                      <p className="text-[10px]" style={{ color: '#8A8886' }}>
                        {m.participants.length} participant{m.participants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────
export function Communication() {
  const { user } = useAuth();
  const { currentBusinessId } = useBusinessContext();
  const isAdmin = ADMIN_ROLES.includes(user?.role ?? '');

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newReclamations, setNewReclamations] = useState<Array<{ channelId: string; name?: string; from?: any }>>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [showNewChan, setShowNewChan] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeNav, setActiveNav] = useState<'chat' | 'teams' | 'calendar'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // If current user is an admin, show the Teams (admin) tab by default
  useEffect(() => {
    if (isAdmin) setActiveNav('teams');
  }, [isAdmin]);

  // Call
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [callDuration, setCallDuration] = useState(0);
  const localRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const pcs = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const curCallId = useRef<string | null>(null);
  const callTimer = useRef<any>(null);
  const callStartTime = useRef<Date | null>(null);

  // ── Socket ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const socket = io(`${SOCKET_URL}/communication`, { auth: { token }, transports: ['websocket'] });

    socket.on('connect', () => { console.info('socket connected'); setConnected(true); });

    // reclamation:new — always listen, use up-to-date isAdmin/user values
    socket.on('reclamation:new', (data: any) => {
      console.info('reclamation:new received', data, { role: user?.role, isAdmin });
      if (!isAdmin) return;
      setNewReclamations(prev => {
        if (prev.find(p => p.channelId === data.channelId)) return prev;
        return [...prev, { channelId: data.channelId, name: data.name, from: data.from }];
      });
    });

    socket.on('disconnect', () => { console.info('socket disconnected'); setConnected(false); });
    socket.on('online:list', (ids: string[]) => setOnlineIds(ids));
    socket.on('user:online', ({ userId }: any) => setOnlineIds(p => [...new Set([...p, userId])]));
    socket.on('user:offline', ({ userId }: any) => setOnlineIds(p => p.filter(id => id !== userId)));
    socket.on('message:new', (msg: Message) => setMessages(p => [...p, msg]));
    socket.on('typing:start', ({ userName }: any) => setTypingUsers(p => [...new Set([...p, userName])]));
    socket.on('typing:stop', ({ userId }: any) => setTypingUsers(p => p.filter(u => u !== userId)));
    socket.on('call:invite', (d: any) => setIncomingCall(d));
    socket.on('call:peer-joined', async ({ userId, userName }: any) => {
      if (!localRef.current) return;
      const pc = mkPC(userId, userName, socket);
      const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
      socket.emit('webrtc:offer', { targetId: userId, callId: curCallId.current, offer });
      setMeetings(prev => prev.map(m => m.callId === curCallId.current
        ? { ...m, participants: [...new Set([...m.participants, userName])] } : m));
    });
    socket.on('webrtc:offer', async ({ from, fromName, offer }: any) => {
      if (!localRef.current) return;
      const pc = mkPC(from, fromName, socket);
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
      socket.emit('webrtc:answer', { targetId: from, callId: curCallId.current, answer });
    });
    socket.on('webrtc:answer', async ({ from, answer }: any) => { await pcs.current.get(from)?.setRemoteDescription(answer); });
    socket.on('webrtc:ice', async ({ from, candidate }: any) => { await pcs.current.get(from)?.addIceCandidate(candidate); });
    socket.on('call:peer-left', ({ userId }: any) => {
      pcs.current.get(userId)?.close(); pcs.current.delete(userId);
      setPeers(p => { const n = new Map(p); n.delete(userId); return n; });
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [isAdmin, user]);

  const handleGoToReclamation = async (channelId: string) => {
    // try find locally
    let ch = channels.find(c => c.id === channelId);
    if (!ch) {
      // refresh channels
      const res = await fetch(`${API_BASE}/communication/channels`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });
      const data = await res.json();
      if (Array.isArray(data)) { setChannels(data); }
      ch = (data || []).find((c: any) => c.id === channelId);
    }
    if (ch) {
      joinChannel(ch);
      setNewReclamations(prev => prev.filter(p => p.channelId !== channelId));
      setActiveNav('chat');
    }
  };

  const mkPC = useCallback((userId: string, userName: string, socket: Socket) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    localRef.current?.getTracks().forEach(t => pc.addTrack(t, localRef.current!));
    pc.ontrack = e => setPeers(p => { const n = new Map(p); n.set(userId, { userId, userName, stream: e.streams[0] }); return n; });
    pc.onicecandidate = e => { if (e.candidate) socket.emit('webrtc:ice', { targetId: userId, callId: curCallId.current, candidate: e.candidate }); };
    pcs.current.set(userId, pc);
    setPeers(p => { const n = new Map(p); if (!n.has(userId)) n.set(userId, { userId, userName }); return n; });
    return pc;
  }, []);

  // ── Load data ────────────────────────────────────────────
  useEffect(() => {
    if (!currentBusinessId) return;
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_BASE}/communication/channels`, { headers }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) { setChannels(data); if (data.length > 0) joinChannel(data[0]); }
    });
    fetch(`${API_BASE}/team-members`, { headers }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setTeamMembers(data);
    }).catch(() => {});
  }, [currentBusinessId]);

  const joinChannel = useCallback((ch: Channel) => {
    setActiveChannel(ch); setMessages([]);
    socketRef.current?.emit('channel:join', { channelId: ch.id });
    const h = (msgs: Message[]) => { setMessages(msgs); socketRef.current?.off('channel:history', h); };
    socketRef.current?.on('channel:history', h);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleCreateChannel = async (name: string, type: 'public' | 'private', memberIds: string[]) => {
    const res = await fetch(`${API_BASE}/communication/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      body: JSON.stringify({ name, type, memberIds }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    const ch = await res.json();
    setChannels(p => [...p, ch]); joinChannel(ch);
  };

  const sendMessage = useCallback(() => {
    if (!input.trim() || !activeChannel) return;
    socketRef.current?.emit('message:send', { channelId: activeChannel.id, content: input.trim() });
    setInput('');
  }, [input, activeChannel]);

  const handleInput = (val: string) => {
    setInput(val);
    if (!activeChannel) return;
    socketRef.current?.emit('typing:start', { channelId: activeChannel.id });
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => socketRef.current?.emit('typing:stop', { channelId: activeChannel.id }), 2000);
  };

  // ── Calls ────────────────────────────────────────────────
  const startCall = useCallback(async (type: 'video' | 'audio' = 'video') => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    localRef.current = stream; setLocalStream(stream); setCallType(type);
    const id = `call-${Date.now()}`; curCallId.current = id; setInCall(true);
    callStartTime.current = new Date();
    socketRef.current?.emit('call:join', { callId: id });
    socketRef.current?.emit('call:invite', { channelId: activeChannel?.id, callId: id, type });
    setCallDuration(0); callTimer.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    // Add to meetings list
    const newMeeting: Meeting = {
      id: id, callId: id,
      channelName: activeChannel?.name ?? 'general',
      startedAt: new Date().toISOString(),
      participants: [user?.name ?? 'You'],
      type,
    };
    setMeetings(p => [newMeeting, ...p]);
    if (activeNav !== 'chat') setActiveNav('chat');
  }, [activeChannel, user, activeNav]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localRef.current = stream; setLocalStream(stream); setCallType(incomingCall.type);
    curCallId.current = incomingCall.callId; setInCall(true);
    callStartTime.current = new Date();
    socketRef.current?.emit('call:join', { callId: incomingCall.callId });
    setIncomingCall(null); setCallDuration(0);
    callTimer.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    setActiveNav('chat');
  }, [incomingCall]);

  const endCall = useCallback(() => {
    clearInterval(callTimer.current);
    const duration = callStartTime.current ? Math.floor((Date.now() - callStartTime.current.getTime()) / 1000) : 0;
    socketRef.current?.emit('call:leave', { callId: curCallId.current });
    localRef.current?.getTracks().forEach(t => t.stop());
    screenRef.current?.getTracks().forEach(t => t.stop());
    pcs.current.forEach(pc => pc.close()); pcs.current.clear();
    localRef.current = null; screenRef.current = null;
    setLocalStream(null); setPeers(new Map()); setInCall(false);
    // Update meeting record with end time
    setMeetings(prev => prev.map(m => m.callId === curCallId.current
      ? { ...m, endedAt: new Date().toISOString(), duration } : m));
    curCallId.current = null; setSharing(false); setCallDuration(0);
  }, []);

  const toggleMute = () => { localRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; }); setMuted(m => !m); };
  const toggleVideo = () => { localRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; }); setVideoOff(v => !v); };
  const toggleShare = async () => {
    if (!sharing) {
      const s = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      screenRef.current = s; setSharing(true);
      const t = s.getVideoTracks()[0];
      pcs.current.forEach(pc => { pc.getSenders().find(s => s.track?.kind === 'video')?.replaceTrack(t); });
      socketRef.current?.emit('screen:share', { callId: curCallId.current, sharing: true });
      t.onended = stopShare;
    } else stopShare();
  };
  const stopShare = () => {
    screenRef.current?.getTracks().forEach(t => t.stop()); screenRef.current = null; setSharing(false);
    const t = localRef.current?.getVideoTracks()[0];
    if (t) pcs.current.forEach(pc => { pc.getSenders().find(s => s.track?.kind === 'video')?.replaceTrack(t); });
    socketRef.current?.emit('screen:share', { callId: curCallId.current, sharing: false });
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fmtDur = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const peersArr = Array.from(peers.values());
  const grouped = messages.reduce<(Message & { grouped: boolean; dateSep?: string })[]>((acc, msg, i) => {
    const prev = messages[i - 1];
    const g = !!(prev && prev.senderId === msg.senderId && new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 300000);
    const ds = (!prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString()) ? new Date(msg.createdAt).toDateString() : undefined;
    return [...acc, { ...msg, grouped: g, dateSep: ds }];
  }, []);

  const navItems = [
    { id: 'chat' as const, icon: '💬', label: 'Chat' },
    { id: 'teams' as const, icon: '👥', label: 'Teams' },
    { id: 'calendar' as const, icon: '📅', label: 'Calendar' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@300;400;600;700&display=swap');
        .ms-root { font-family: 'Segoe UI', system-ui, sans-serif; }
        .ms-scroll::-webkit-scrollbar { width: 6px; }
        .ms-scroll::-webkit-scrollbar-track { background: transparent; }
        .ms-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
        .chan-item:hover { background: rgba(98,100,167,0.08); }
        .chan-active { background: rgba(98,100,167,0.15) !important; }
        .msg-in { animation: msgin 0.15s ease; }
        @keyframes msgin { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes typingDot { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-3px); opacity:1; } }
        @keyframes slideIn { from { transform:translateX(20px); opacity:0; } to { transform:none; opacity:1; } }
      `}</style>

      <div className="ms-root flex h-[calc(100vh-5rem)] rounded-xl overflow-hidden bg-white"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.12)', border: '1px solid #E1DFDD' }}>

        {/* Reclamation notifications for admins */}
        {isAdmin && newReclamations.length > 0 && (
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}>
            <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', padding: '10px 14px', borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontWeight: 700, color: '#7A4F01' }}>Nouvelle réclamation</div>
                <div style={{ fontSize: 13, color: '#604400' }}>{newReclamations.length} nouvelle(s)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {newReclamations.map(nr => (
                    <button key={nr.channelId} onClick={() => handleGoToReclamation(nr.channelId)} style={{ background: '#7A4F01', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6 }}>
                      Aller au canal
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Far-left nav */}
        <div className="w-14 flex flex-col items-center py-3 gap-1 border-r flex-shrink-0"
          style={{ background: '#6264A7', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm mb-3">BM</div>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)}
              className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${activeNav === n.id ? 'bg-white/25' : 'hover:bg-white/15'}`}
              title={n.label}>
              <span className="text-base">{n.icon}</span>
              <span className="text-[8px] text-white/70 font-medium">{n.label}</span>
            </button>
          ))}
          {inCall && (
            <div className="mt-2 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[8px] text-white/60 mt-0.5">{fmtDur(callDuration)}</span>
            </div>
          )}
          <div className="flex-1" />
          <div className="mb-2"><Av name={user?.name ?? 'U'} size={32} online={true} /></div>
        </div>

        {/* Sidebar (only for chat) */}
        {activeNav === 'chat' && (
          <div className="w-64 flex flex-col flex-shrink-0 border-r" style={{ background: '#F5F5F5', borderColor: '#E1DFDD' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: '#E1DFDD' }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-sm" style={{ color: '#201F1E' }}>Chat</h2>
                {isAdmin && (
                  <button onClick={() => setShowNewChan(true)}
                    className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-lg"
                    title="Create channel">+</button>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white" style={{ border: '1px solid #E1DFDD' }}>
                <span className="text-gray-400 text-sm">🔍</span>
                <input className="flex-1 text-xs outline-none bg-transparent placeholder-gray-400" placeholder="Search channels..." />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto ms-scroll py-2">
              {isAdmin && (
                <div className="mx-3 mb-2 px-3 py-1.5 rounded-lg flex items-center gap-2"
                  style={{ background: 'rgba(98,100,167,0.08)', border: '1px solid rgba(98,100,167,0.15)' }}>
                  <span className="text-xs">🛡️</span>
                  <span className="text-[11px] font-semibold" style={{ color: '#6264A7' }}>Admin</span>
                </div>
              )}
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8A8886' }}>
                Channels · {channels.length}
              </p>
              {channels.map(ch => (
                <button key={ch.id} onClick={() => joinChannel(ch)}
                  className={`chan-item w-full text-left flex items-center gap-2.5 px-4 py-2 transition-all ${activeChannel?.id === ch.id ? 'chan-active' : ''}`}>
                  <div className="w-7 h-7 rounded flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: activeChannel?.id === ch.id ? 'rgba(98,100,167,0.2)' : '#E8E8E8', color: activeChannel?.id === ch.id ? '#6264A7' : '#8A8886' }}>
                    {ch.type === 'private' ? '🔒' : '#'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: activeChannel?.id === ch.id ? '#6264A7' : '#201F1E' }}>{ch.name}</p>
                  </div>
                  {ch.isDefault && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(98,100,167,0.1)', color: '#6264A7' }}>default</span>
                  )}
                  {/* Badge for new reclamation notifications */}
                  {newReclamations.find(n => n.channelId === ch.id) && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: '#FFEDD5', color: '#7C2D12', marginLeft: 8 }}>Nouvelle</span>
                  )}
                </button>
              ))}
              <p className="px-4 py-1 mt-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8A8886' }}>Online · {onlineIds.length}</p>
              {onlineIds.slice(0, 8).map(id => (
                <div key={id} className="chan-item flex items-center gap-2.5 px-4 py-1.5 cursor-default">
                  <Av name={id === user?.id ? (user?.name ?? 'U') : 'User'} size={28} online={true} />
                  <span className="text-sm truncate" style={{ color: '#201F1E' }}>
                    {id === user?.id ? `${user?.name} (You)` : id.slice(0, 14)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t" style={{ borderColor: '#E1DFDD' }}>
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl chan-item">
                <Av name={user?.name ?? 'U'} size={32} online={true} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#201F1E' }}>{user?.name}</p>
                  <p className="text-[10px] capitalize truncate" style={{ color: '#8A8886' }}>{user?.role?.replace(/_/g, ' ')}</p>
                </div>
                {connected && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#6BB700' }} />}
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        {activeNav === 'teams' && (
          <TeamsTab members={teamMembers} onlineIds={onlineIds} user={user} />
        )}
        {activeNav === 'calendar' && (
          <CalendarTab meetings={meetings} onStartMeeting={() => { setActiveNav('chat'); setTimeout(() => startCall('video'), 100); }} />
        )}

        {activeNav === 'chat' && (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0" style={{ borderColor: '#E1DFDD' }}>
              <div className="flex items-center gap-3">
                {activeChannel ? (
                  <>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{ background: 'rgba(98,100,167,0.1)', color: '#6264A7' }}>
                      {activeChannel.type === 'private' ? '🔒' : '#'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: '#201F1E' }}>{activeChannel.name}</h3>
                      <p className="text-[11px]" style={{ color: '#8A8886' }}>{onlineIds.length} online</p>
                    </div>
                  </>
                ) : <span className="text-sm" style={{ color: '#8A8886' }}>Select a channel</span>}
              </div>
              <div className="flex items-center gap-1">
                {activeChannel && !inCall && (
                  <>
                    <button onClick={() => startCall('audio')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-gray-100"
                      style={{ color: '#6264A7' }}>
                      <span>📞</span> Call
                    </button>
                    <button onClick={() => startCall('video')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: '#6264A7' }}>
                      <span>📹</span> Meet Now
                    </button>
                  </>
                )}
                {inCall && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(98,100,167,0.1)', color: '#6264A7', border: '1px solid rgba(98,100,167,0.2)' }}>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold">{fmtDur(callDuration)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video */}
            {inCall && (
              <div className="flex-shrink-0 flex flex-col" style={{ background: '#201F1E' }}>
                <div className="p-4">
                  <div className={`grid gap-3 ${peersArr.length === 0 ? 'grid-cols-1 max-w-sm mx-auto' : peersArr.length === 1 ? 'grid-cols-2' : peersArr.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                    <VideoTile stream={sharing && screenRef.current ? screenRef.current : localStream} name={user?.name ?? 'You'} muted isScreen={sharing} />
                    {peersArr.map(p => <VideoTile key={p.userId} stream={p.stream ?? null} name={p.userName} />)}
                  </div>
                  {peersArr.length === 0 && <p className="text-center text-white/40 text-xs mt-3">Waiting for others to join...</p>}
                </div>
                <div className="flex items-center justify-center gap-3 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  {[
                    { fn: toggleMute, active: muted, icon: muted ? '🔇' : '🎙️', title: muted ? 'Unmute' : 'Mute' },
                    { fn: toggleVideo, active: videoOff, icon: videoOff ? '📵' : '📷', title: 'Toggle camera' },
                    { fn: toggleShare, active: sharing, icon: '🖥️', title: sharing ? 'Stop sharing' : 'Share screen' },
                  ].map(btn => (
                    <button key={btn.title} onClick={btn.fn} title={btn.title}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110"
                      style={{ background: btn.active ? '#6264A7' : 'rgba(255,255,255,0.1)' }}>
                      {btn.icon}
                    </button>
                  ))}
                  <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <button onClick={endCall}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm"
                    style={{ background: '#C43E1C' }}>Leave</button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto ms-scroll px-5 py-4">
              {grouped.length === 0 && !inCall && (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: 'rgba(98,100,167,0.1)' }}>💬</div>
                  <div className="text-center">
                    <p className="font-semibold text-sm" style={{ color: '#201F1E' }}>Welcome to #{activeChannel?.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#8A8886' }}>This is the beginning of the channel</p>
                  </div>
                </div>
              )}
              {grouped.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id}>
                    {msg.dateSep && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px" style={{ background: '#E1DFDD' }} />
                        <span className="text-[11px] font-medium px-2" style={{ color: '#8A8886' }}>
                          {new Date(msg.dateSep).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-px" style={{ background: '#E1DFDD' }} />
                      </div>
                    )}
                    <div className={`msg-in flex gap-3 ${msg.grouped ? 'mt-0.5' : 'mt-4'} group`}>
                      {!msg.grouped ? <Av name={msg.senderName} size={36} />
                        : <div className="w-9 flex-shrink-0 flex items-center justify-center">
                            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#8A8886' }}>{fmtTime(msg.createdAt)}</span>
                          </div>}
                      <div className="flex-1 min-w-0">
                        {!msg.grouped && (
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-sm" style={{ color: '#201F1E' }}>{isMe ? 'You' : msg.senderName}</span>
                            <span className="text-[11px]" style={{ color: '#8A8886' }}>{fmtTime(msg.createdAt)}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed" style={{ color: '#201F1E' }}>{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 mt-3 px-1">
                  <div className="flex gap-0.5">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#6264A7', animation: `typingDot 1.2s infinite ${i * 0.2}s` }} />)}
                  </div>
                  <span className="text-[11px]" style={{ color: '#8A8886' }}>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 flex-shrink-0">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E1DFDD', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-1 px-3 py-1.5 border-b" style={{ borderColor: '#F0F0F0', background: '#FAFAFA' }}>
                  {['B','I','U'].map(f => <button key={f} className="w-6 h-6 rounded text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors">{f}</button>)}
                  <div className="w-px h-4 mx-1 bg-gray-200" />
                  {['😊','📎','@'].map(ic => <button key={ic} className="w-6 h-6 rounded text-sm text-gray-500 hover:bg-gray-200 flex items-center justify-center">{ic}</button>)}
                </div>
                <div className="flex items-end gap-2 px-3 py-2.5">
                  <textarea ref={inputRef} rows={1}
                    className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent placeholder-gray-400"
                    style={{ color: '#201F1E', maxHeight: 120 }}
                    placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Select a channel'}
                    value={input}
                    onChange={e => { handleInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); if (inputRef.current) inputRef.current.style.height = 'auto'; } }}
                    disabled={!activeChannel} />
                  <button onClick={sendMessage} disabled={!input.trim() || !activeChannel}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30"
                    style={{ background: input.trim() ? '#6264A7' : '#E1DFDD' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-[10px] mt-1.5 ml-1" style={{ color: '#8A8886' }}>Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        )}
      </div>

      {showNewChan && isAdmin && (
        <NewChannelModal onClose={() => setShowNewChan(false)} onCreate={handleCreateChannel} members={teamMembers} />
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6" style={{ pointerEvents: 'none' }}>
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#201F1E', border: '1px solid rgba(255,255,255,0.1)', width: 320, pointerEvents: 'all', animation: 'slideIn 0.3s ease' }}>
            <div className="px-5 py-4">
              <p className="text-white/60 text-xs mb-3 font-medium uppercase tracking-wider">Incoming {incomingCall.type} call</p>
              <div className="flex items-center gap-3 mb-4">
                <Av name={incomingCall.callerName} size={44} />
                <div>
                  <p className="text-white font-semibold">{incomingCall.callerName}</p>
                  <p className="text-white/50 text-sm">{incomingCall.type === 'video' ? 'Video call' : 'Audio call'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIncomingCall(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}>Decline</button>
                <button onClick={acceptCall}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#6BB700' }}>Accept</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
