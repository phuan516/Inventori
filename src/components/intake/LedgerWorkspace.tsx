'use client';

import { useState, useEffect } from 'react';
import T from '@/lib/theme';
import Btn from '@/components/ui/Btn';
import Panel from '@/components/ui/Panel';
import { useIntake } from '@/hooks/useIntake';
import { INTAKES } from '@/lib/intakeData';
import ScanField from './ScanField';
import LedgerRow from './LedgerRow';
import CommitConfirm from './CommitConfirm';
import CommittedState from './CommittedState';
import IntakeStatus from './IntakeStatus';
import { IIcon } from './IntakeIcons';

export default function LedgerWorkspace() {
  const ik = useIntake();
  const [openSetup, setOpenSetup] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const intake = INTAKES[0];

  useEffect(() => {
    const p = ik.lines.find(l => !l.matched);
    if (p && openSetup === null) setOpenSetup(p.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit() { ik.setCommitted(true); setConfirming(false); }

  return (
    <>
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 28px', borderBottom: `1px solid ${T.rule}`, background: T.panel,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontFamily: T.fontMono, color: T.mute }}>{intake.ref}</span>
              <IntakeStatus status={ik.committed ? 'committed' : 'draft'} size="md" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: '-.02em' }}>
              {intake.title}
            </h1>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, marginTop: 4,
              fontSize: 12.5, color: T.mute,
            }}>
              <IIcon.truck s={14} />
              {intake.supplier}
              <span style={{ color: T.faint }}>·</span>
              {intake.date}
            </div>
          </div>
          <Btn kind="ghost">Save draft</Btn>
        </header>

        {ik.committed ? (
          <CommittedState summary={ik.summary} onReset={() => ik.setCommitted(false)} />
        ) : (
          <>
            {/* Scan zone */}
            <div style={{ padding: '20px 28px 14px' }}>
              <ScanField onScan={ik.scan} onSimulate={ik.simulate} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14 }}>
                <LedgerStat label="Products" value={ik.summary.skus} />
                <Sep />
                <LedgerStat label="Units scanned" value={ik.summary.units} />
                <Sep />
                <LedgerStat
                  label="Intake value"
                  value={'$' + ik.summary.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                />
                <div style={{ flex: 1 }} />
                {ik.summary.pending > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, color: T.warn, background: T.warnSoft,
                    padding: '5px 10px', borderRadius: 7,
                  }}>
                    <IIcon.alert s={13} /> {ik.summary.pending} need setup
                  </span>
                )}
              </div>
            </div>

            {/* Lines table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 16px' }}>
              <Panel style={{ overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr 130px 116px 96px 96px 34px',
                  gap: 12, padding: '10px 16px', alignItems: 'center',
                  borderBottom: `1px solid ${T.rule2}`, background: T.bg,
                  fontSize: 10.5, fontWeight: 600, color: T.mute,
                  letterSpacing: '.05em', textTransform: 'uppercase',
                }}>
                  <div /><div>Product</div><div>Barcode</div><div>Qty received</div>
                  <div style={{ textAlign: 'right' }}>Unit cost</div>
                  <div style={{ textAlign: 'right' }}>Line total</div>
                  <div />
                </div>
                {ik.lines.map(l => (
                  <LedgerRow
                    key={l.id}
                    l={l}
                    flash={ik.flash === l.id}
                    open={openSetup === l.id}
                    onToggleSetup={() => setOpenSetup(o => o === l.id ? null : l.id)}
                    onBump={(d) => ik.bump(l.id, d)}
                    onCost={(c) => ik.setCost(l.id, c)}
                    onRemove={() => ik.remove(l.id)}
                    onResolve={(patch) => { ik.resolve(l.id, patch); setOpenSetup(null); }}
                  />
                ))}
              </Panel>
            </div>

            {/* Commit footer */}
            <footer style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 28px', borderTop: `1px solid ${T.rule}`, background: T.panel,
            }}>
              <div style={{ fontSize: 13, color: T.mute }}>
                <strong style={{ color: T.ink, fontWeight: 600 }}>{ik.summary.units} units</strong>
                {' · '}{ik.summary.skus} products{' · '}
                <span style={{ fontFamily: T.fontMono }}>
                  ${ik.summary.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                {' at cost'}
              </div>
              <div style={{ flex: 1 }} />
              <Btn kind="ghost">Discard</Btn>
              <Btn
                kind="primary"
                icon={<IIcon.inbox s={15} />}
                onClick={() => setConfirming(true)}
                style={ik.summary.pending > 0 ? { background: T.faint } : {}}
              >
                Commit to inventory
              </Btn>
            </footer>
          </>
        )}

        {confirming && (
          <CommitConfirm
            summary={ik.summary}
            onCancel={() => setConfirming(false)}
            onConfirm={commit}
          />
        )}
      </main>
    </>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 26, background: T.rule }} />;
}

function LedgerStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{
        fontSize: 19, fontWeight: 600, letterSpacing: '-.02em',
        fontFamily: T.fontMono, lineHeight: 1,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: T.mute, marginTop: 4 }}>{label}</div>
    </div>
  );
}
