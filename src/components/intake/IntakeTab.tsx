'use client';

import T from '@/lib/theme';
import IntakeList from './IntakeList';
import LedgerWorkspace from './LedgerWorkspace';

export default function IntakeTab() {
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
        <IntakeList onNew={() => {}} />
      </aside>
      <LedgerWorkspace />
    </div>
  );
}
