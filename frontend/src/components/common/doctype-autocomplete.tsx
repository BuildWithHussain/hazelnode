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

export function DocTypeAutoComplete({ doctype, onChange }: { doctype: string, onChange: (value: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

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
                      setValue(currentValue === value ? '' : currentValue);
                      setOpen(false);
                      onChange(currentValue);
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
