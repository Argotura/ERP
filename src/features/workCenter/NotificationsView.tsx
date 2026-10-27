// ============================================================
// ARGOTURO ERP — System Notifications View
// ============================================================

import React from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle, AlertOctagon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NotificationsView() {
  const { store, markNotificationRead } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Notifikasi Sistem & Peringatan Operasional
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Pantau pemberitahuan transaksi, perubahan status, dan peringatan inventaris
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => {
            store.notifications.forEach((n) => markNotificationRead(n.id));
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
        >
          <CheckCheck size={14} /> Tandai Semua Dibaca
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {store.notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Tidak ada notifikasi sistem saat ini.
          </div>
        ) : (
          <div>
            {store.notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: n.isRead ? '#ffffff' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  cursor: 'pointer',
                  borderLeft: n.isRead ? '3px solid transparent' : '3px solid #3b82f6',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      n.type === 'danger'
                        ? '#fee2e2'
                        : n.type === 'warning'
                        ? '#fef3c7'
                        : n.type === 'success'
                        ? '#dcfce7'
                        : '#eff6ff',
                    color:
                      n.type === 'danger'
                        ? '#ef4444'
                        : n.type === 'warning'
                        ? '#d97706'
                        : n.type === 'success'
                        ? '#16a34a'
                        : '#3b82f6',
                  }}
                >
                  {n.type === 'danger' ? (
                    <AlertOctagon size={16} />
                  ) : n.type === 'warning' ? (
                    <AlertTriangle size={16} />
                  ) : n.type === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Info size={16} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13.5, fontWeight: n.isRead ? 500 : 700, color: '#1e293b' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(n.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  {n.targetRole && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 6,
                        fontSize: 10.5,
                        fontWeight: 600,
                        backgroundColor: '#e2e8f0',
                        color: '#475569',
                        padding: '1px 6px',
                        borderRadius: 3,
                      }}
                    >
                      Penerima: {n.targetRole}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

