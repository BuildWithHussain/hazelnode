import * as React from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { useFrappeGetDocList } from 'frappe-react-sdk';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DocTypeRecord {
  name: string;
}

interface DocTypeAutoCompleteProps {
  doctype: string;
  onChange: (value: string) => void;
  value?: string;
  disabled?: boolean;
}

export function DocTypeAutoComplete({
  doctype,
  onChange,
  value: controlledValue,
  disabled = false,
}: DocTypeAutoCompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState('');

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue ?? internalValue;
  const setValue = (newValue: string) => {
    setInternalValue(newValue);
    onChange(newValue);
  };

  const { data: documents } = useFrappeGetDocList<DocTypeRecord>(
    doctype,
    {
      fields: ['name'],
    }
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          outline={true}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[200px] justify-between"
        >
          {value
            ? documents?.find((doc) => doc.name === value)?.name
            : `Select ${doctype}...`}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {documents && (
              <CommandList>
                {documents.map((doc) => (
                  <CommandItem
                    key={doc.name}
                    value={doc.name}
                    onSelect={(currentValue) => {
                      const newValue = currentValue === value ? '' : currentValue;
                      setValue(newValue);
                      setOpen(false);
                    }}
                  >
                    {doc.name}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === doc.name ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandList>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
