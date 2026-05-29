import T from '@/lib/theme';
import Btn from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import type { IntakeSummary } from '@/hooks/useIntake';

interface Props {
  summary: IntakeSummary;
  onReset: () => void;
}

export default function CommittedState({ summary, onReset }: Props) {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 40 }}>
      <div className="inv-pop" style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: T.okSoft,
          color: T.ok, display: 'grid', placeItems: 'center', margin: '0 auto 18px',
        }}>
          <Icon.check s={26} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.01em', marginBottom: 6 }}>
          Intake committed
        </div>
        <div style={{ fontSize: 13.5, color: T.mute, lineHeight: 1.6, marginBottom: 20 }}>
          {summary.units} units across {summary.skus} products were added to inventory.
          The intake is now archived as committed.
        </div>
        <Btn kind="primary" icon={<Icon.plus s={13} />} onClick={onReset}>
          Start a new intake
        </Btn>
      </div>
    </div>
  );
}
