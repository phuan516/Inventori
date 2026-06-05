'use client';

import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';
import { IIcon } from './IntakeIcons';
import CostCell from './CostCell';
import PendingSetup from './PendingSetup';
import type { IntakeLine } from '@/lib/intakeData';

interface Props {
  l: IntakeLine;
  flash: boolean;
  open: boolean;
  onToggleSetup: () => void;
  onBump: (d: number) => void;
  onCost: (c: number) => void;
  onRemove: () => void;
  onResolve: (patch: Partial<IntakeLine>) => void;
}

export default function LedgerRow({ l, flash, open, onToggleSetup, onBump, onCost, onRemove, onResolve }: Props) {
  const pending = !l.matched;
  const editing = open && !pending;
  return (
    <div
      className={flash ? 'intk-flash' : undefined}
      style={{
        borderBottom: `1px solid ${T.rule2}`,
        background: pending ? `${T.warnSoft}66` : 'transparent',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '44px 1fr 130px 116px 96px 96px 64px',
        gap: 12, padding: '11px 16px', alignItems: 'center',
      }}>
        {pending ? (
          <div style={{
            width: 36, height: 36, borderRadius: 7, background: T.warnSoft,
            border: `1px dashed ${T.warn}66`,
            display: 'grid', placeItems: 'center', color: T.warn,
          }}>
            <IIcon.sparkle s={15} />
          </div>
        ) : (
          <ImgPlaceholder w={36} h={36} hue={l.hue} sat={9} radius={7} />
        )}

        <div style={{ minWidth: 0 }}>
          {pending ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.warn }}>
                Unrecognised barcode
              </div>
              <div style={{ fontSize: 11.5, color: T.mute, marginTop: 1 }}>
                Not in catalog — set up to commit
              </div>
            </>
          ) : (
            <>
              <div style={{
                fontSize: 13.5, fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{l.name}</div>
              <div style={{ fontSize: 11.5, color: T.mute, marginTop: 1 }}>
                {l.mfr} · {l.cat}
                {l.onHand != null && (
                  <span style={{ color: T.faint }}> · {l.onHand} on hand</span>
                )}
              </div>
            </>
          )}
        </div>

        <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.ink2 }}>{l.upc || l.sku}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <StepBtn onClick={() => onBump(-1)} disabled={l.qty === 0}>
            <Icon.minus s={11} />
          </StepBtn>
          <span style={{
            minWidth: 30, textAlign: 'center',
            fontFamily: T.fontMono, fontWeight: 600, fontSize: 13.5,
          }}>{l.qty}</span>
          <StepBtn onClick={() => onBump(1)}>
            <Icon.plus s={11} />
          </StepBtn>
        </div>

        <div style={{ textAlign: 'right' }}>
          {pending
            ? <span style={{ fontSize: 12, color: T.faint }}>—</span>
            : <CostCell value={l.cost} onChange={onCost} />}
        </div>

        <span style={{
          textAlign: 'right', fontFamily: T.fontMono, fontSize: 13,
          color: pending ? T.faint : T.ink,
        }}>
          {pending ? '—' : `$${(l.qty * l.cost).toFixed(2)}`}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {!pending && (
            <button
              onClick={onToggleSetup}
              title={open ? 'Close edit' : 'Edit product'}
              style={{
                width: 28, height: 28, border: 'none', background: 'transparent',
                color: open ? T.brand : T.faint, borderRadius: 6, cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                transition: 'background .12s, color .12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.brandSoft;
                e.currentTarget.style.color = T.brand;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = open ? T.brand : T.faint;
              }}
            >
              <Icon.edit s={13} />
            </button>
          )}
          <button
            onClick={onRemove}
            title="Remove"
            style={{
              width: 28, height: 28, border: 'none', background: 'transparent',
              color: T.faint, borderRadius: 6, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              transition: 'background .12s, color .12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.dangerSoft;
              e.currentTarget.style.color = T.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = T.faint;
            }}
          >
            <Icon.x s={13} />
          </button>
        </div>
      </div>

      {(pending || editing) && (
        <div style={{ padding: '0 16px 14px 72px' }}>
          {open ? (
            <div style={{
              background: T.panel, border: `1px solid ${T.rule}`,
              borderRadius: 10, padding: 16,
            }}>
              <PendingSetup line={l} onSave={onResolve} onCancel={onToggleSetup} isEdit={!pending} />
            </div>
          ) : (
            <Btn
              kind="ghost"
              icon={<Icon.plus s={13} />}
              onClick={onToggleSetup}
              style={{ height: 30, borderColor: `${T.warn}66`, color: T.warn }}
            >
              Set up product
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}

function StepBtn({ children, onClick, disabled }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 22, height: 22, borderRadius: 5, border: `1px solid ${T.rule}`,
        background: T.panel, color: T.ink2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'grid', placeItems: 'center',
        opacity: disabled ? 0.4 : 1, padding: 0,
      }}
    >
      {children}
    </button>
  );
}
