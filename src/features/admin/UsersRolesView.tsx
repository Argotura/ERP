// ============================================================
// ARGOTURO ERP — Users & Roles Simulation (Pengguna & Hak Akses)
// ============================================================

import React from 'react';
import { Users, Shield, CheckCircle2, UserCheck, Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function UsersRolesView() {
  const { store, activeUserId, setActiveUserId, addToast } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Pengguna Sistem & Simulasi Hak Akses (Role Switcher)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Ganti persona seketika untuk mendemonstrasikan batasan otorisasi antar departemen secara interaktif
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {store.users.map((u) => {
          const isActive = u.id === activeUserId;
          return (
            <div
              key={u.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 8,
                border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                padding: 20,
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#3b82f6' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{u.name}</h3>
                      <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{u.role}</div>
                    </div>
                  </div>

                  {isActive && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 20,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      AKTIF SAAT INI
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 16, fontSize: 12.5, color: '#475569' }}>
                  <div>
                    Departemen: <strong>{u.department}</strong>
                  </div>
                  <div style={{ marginTop: 3 }}>
                    Email: <strong>{u.email}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUserId(u.id);
                    addToast('info', `Beralih ke persona: ${u.name} (${u.role})`);
                  }}
                  className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                  disabled={isActive}
                >
                  <UserCheck size={14} />
                  {isActive ? 'Persona Sedang Digunakan' : 'Simulasikan Sebagai Pengguna Ini'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

