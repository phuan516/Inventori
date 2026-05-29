'use client';

import T from '@/lib/theme';
import Btn from '@/components/ui/Btn';
import { IIcon } from './IntakeIcons';
import type { IntakeSummary } from '@/hooks/useIntake';

interface Props {
  summary: IntakeSummary;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CommitConfirm({ summary, onCancel, onConfirm }: Props) {
  const blocked = summary.pending > 0;

  return (
    <div
      onClick={onCancel}
      className="inv-fade-in"
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        background: 'rgba(15,20,25,.42)', backdropFilter: 'blur(3px)',
        display: 'grid', placeItems: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400, background: T.panel, borderRadius: 14, padding: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,.3)',
          animation: 'intkPop .2s ease',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: blocked ? T.warnSoft : T.brandSoft,
          color: blocked ? T.warn : T.brand,
          display: 'grid', placeItems: 'center', marginBottom: 14,
        }}>
          {blocked ? <IIcon.alert s={20} /> : <IIcon.inbox s={20} />}
        </div>

        {blocked ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              {summary.pending} item{summary.pending > 1 ? 's' : ''} still need setup
            </div>
            <div style={{ fontSize: 13, color: T.mute, lineHeight: 1.55, marginBottom: 18 }}>
              Set up the pending products before committing — they can&apos;t be added to inventory without a catalog entry.
            </div>
            <Btn kind="primary" onClick={onCancel} style={{ width: '100%' }}>Review pending items</Btn>
          </>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Commit to inventory?</div>
            <div style={{ fontSize: 13, color: T.mute, lineHeight: 1.55, marginBottom: 16 }}>
              This adds <strong style={{ color: T.ink }}>{summary.units} units</strong> across{' '}
              <strong style={{ color: T.ink }}>{summary.skus} products</strong> to your on-hand counts.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn kind="ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</Btn>
              <Btn kind="primary" onClick={onConfirm} style={{ flex: 1 }}>
                Commit {summary.units} units
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
