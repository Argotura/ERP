// ============================================================
// ARGOTURO ERP — Recent Operational Activities Log
// ============================================================

import React from 'react';
import { Activity, Clock, User, ShieldCheck, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ActivitiesView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Aktivitas Operasional Terakhir (Activity Feed)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Kronologi aksi pengguna dan perubahan status dokumen di seluruh modul sistem
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 20 }}>
        {store.activityLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Belum ada aktivitas yang tercatat.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {store.activityLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: '#eff6ff',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Activity size={16} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                        {log.user}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {log.role}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#3b82f6',
                        }}
                      >
                        [{log.module}]
                      </span>
                    </div>

                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                    {log.description}
                  </p>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    Referensi ID: {log.entityNumber} ({log.action})
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

