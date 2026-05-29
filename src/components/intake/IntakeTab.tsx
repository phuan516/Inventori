'use client';

import { useEffect, useState, useRef } from 'react';
import T from '@/lib/theme';
import IntakeList from './IntakeList';
import LedgerWorkspace from './LedgerWorkspace';
import { IIcon } from './IntakeIcons';
import type { IntakeSession, IntakeLine } from '@/lib/intakeData';

function LedgerSkeleton() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
      <style>{`@keyframes ldg-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header skeleton */}
      <div style={{
        padding: '16px 28px', borderBottom: `1px solid ${T.rule}`, background: T.panel,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ height: 11, width: 64, borderRadius: 3, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 11, width: 44, borderRadius: 8, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out infinite' }} />
          </div>
          <div style={{ height: 18, width: 200, borderRadius: 4, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out .1s infinite' }} />
          <div style={{ height: 11, width: 100, borderRadius: 3, background: T.rule2, animation: 'ldg-pulse 1.4s ease-in-out .2s infinite' }} />
        </div>
        <div style={{ height: 30, width: 80, borderRadius: 7, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out infinite' }} />
      </div>

      {/* Scan zone skeleton */}
      <div style={{ padding: '20px 28px 14px' }}>
        <div style={{ height: 40, borderRadius: 9, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out .05s infinite' }} />
        <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
          {[56, 72, 80].map((w, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ height: 19, width: w, borderRadius: 3, background: T.rule, animation: `ldg-pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
              <div style={{ height: 10, width: w * 0.7, borderRadius: 3, background: T.rule2, animation: `ldg-pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div style={{ flex: 1, padding: '0 28px 16px' }}>
        <div style={{ borderRadius: 10, border: `1px solid ${T.rule}`, overflow: 'hidden', background: T.panel }}>
          {/* Column header bar */}
          <div style={{ height: 36, background: T.bg, borderBottom: `1px solid ${T.rule2}` }} />
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderTop: i > 0 ? `1px solid ${T.rule2}` : 'none',
              animation: `ldg-pulse 1.4s ease-in-out ${i * 0.12}s infinite`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: T.rule, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ height: 12, width: `${45 + i * 10}%`, borderRadius: 3, background: T.rule }} />
                <div style={{ height: 10, width: '25%', borderRadius: 3, background: T.rule2 }} />
              </div>
              <div style={{ height: 12, width: 60, borderRadius: 3, background: T.rule }} />
              <div style={{ height: 28, width: 88, borderRadius: 6, background: T.rule }} />
              <div style={{ height: 12, width: 56, borderRadius: 3, background: T.rule }} />
              <div style={{ height: 12, width: 56, borderRadius: 3, background: T.rule }} />
              <div style={{ width: 20, height: 20, borderRadius: 4, background: T.rule }} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 28px', borderTop: `1px solid ${T.rule}`, background: T.panel,
      }}>
        <div style={{ height: 12, width: 180, borderRadius: 3, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out infinite' }} />
        <div style={{ flex: 1 }} />
        <div style={{ height: 32, width: 72, borderRadius: 7, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out .05s infinite' }} />
        <div style={{ height: 32, width: 148, borderRadius: 7, background: T.rule, animation: 'ldg-pulse 1.4s ease-in-out .1s infinite' }} />
      </div>
    </main>
  );
}

export default function IntakeTab() {
  const storeId = useRef<string | null>(null);
  const [intakes, setIntakes] = useState<IntakeSession[]>([]);
  const [selectedIntake, setSelectedIntake] = useState<IntakeSession | null>(null);
  const [intakeLines, setIntakeLines] = useState<IntakeLine[]>([]);
  const [loadingIntakes, setLoadingIntakes] = useState(true);
  const [loadingLines, setLoadingLines] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    storeId.current = localStorage.getItem('inventori_store_id');
    if (!storeId.current) { setLoadingIntakes(false); return; }
    fetchIntakes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchIntakes() {
    try {
      const data = await fetch(`/api/intake?storeId=${storeId.current}`).then(r => r.json());
      setIntakes(data.intakes ?? []);
    } finally {
      setLoadingIntakes(false);
    }
  }

  async function handleSelectIntake(intake: IntakeSession) {
    setSelectedIntake(intake);
    setLoadingLines(true);
    try {
      const data = await fetch(`/api/intake/${intake.id}`).then(r => r.json());
      setIntakeLines(data.lines ?? []);
    } finally {
      setLoadingLines(false);
    }
  }

  async function handleNewIntake() {
    if (!storeId.current || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: storeId.current }),
      });
      const data = await res.json();
      if (!res.ok) return;
      const newIntake: IntakeSession = data.intake;
      setIntakes(prev => [newIntake, ...prev]);
      setIntakeLines([]);
      setSelectedIntake(newIntake);
    } finally {
      setCreating(false);
    }
  }

  async function handleCommitted() {
    // Refresh list so the committed intake shows the updated status
    if (storeId.current) {
      const data = await fetch(`/api/intake?storeId=${storeId.current}`).then(r => r.json());
      setIntakes(data.intakes ?? []);
    }
  }

  if (!storeId.current && !loadingIntakes) {
    return (
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: T.mute, fontSize: 14 }}>
        No store selected. Go to Sheets to pick a store.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '264px 1fr',
      flex: 1, minHeight: 0, overflow: 'hidden',
    }}>
      <aside style={{
        background: T.panel, borderRight: `1px solid ${T.rule}`,
        display: 'flex', flexDirection: 'column', minHeight: 0,
      }}>
        <div style={{ padding: '17px 16px 14px', borderBottom: `1px solid ${T.rule2}` }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-.01em' }}>Intake</div>
          <div style={{ fontSize: 11.5, color: T.mute, marginTop: 1 }}>Receiving sessions</div>
        </div>
        <IntakeList
          intakes={intakes}
          selectedId={selectedIntake?.id ?? null}
          loading={loadingIntakes}
          creating={creating}
          onSelect={handleSelectIntake}
          onNew={handleNewIntake}
        />
      </aside>

      {loadingLines ? (
        <LedgerSkeleton />
      ) : selectedIntake ? (
        <LedgerWorkspace
          key={selectedIntake.id}
          intake={selectedIntake}
          initialLines={intakeLines}
          onCommitted={handleCommitted}
          onNew={handleNewIntake}
        />
      ) : (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center', color: T.mute }}>
            <IIcon.inbox s={32} />
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 500, color: T.ink2 }}>No intake selected</div>
            <div style={{ marginTop: 4, fontSize: 13, color: T.mute }}>
              Choose a session from the list or start a new one.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
