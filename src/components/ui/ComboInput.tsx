import type { InputHTMLAttributes } from 'react';
import Input from './Input';

interface ComboInputProps extends InputHTMLAttributes<HTMLInputElement> {
  listId: string;
  options: string[];
}

export default function ComboInput({ listId, options, ...props }: ComboInputProps) {
  return (
    <>
      <Input list={listId} {...props} />
      <datalist id={listId}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    </>
  );
}
