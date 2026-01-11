import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DocTypeAutoComplete } from '@/components/common/doctype-autocomplete';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ParamFieldProps {
  param: HazelNodeParam;
  value: string;
  onChange: (fieldname: string, value: string) => void;
  disabled?: boolean;
}

export function ParamField({
  param,
  value,
  onChange,
  disabled = false,
}: ParamFieldProps) {
  const handleChange = (newValue: string) => {
    onChange(param.fieldname, newValue);
  };

  return (
    <div className="mb-3">
      <Label htmlFor={param.fieldname}>{param.label}</Label>

      {param.fieldtype === 'Link' && (
        <DocTypeAutoComplete
          onChange={handleChange}
          doctype={param.options || 'DocType'}
          disabled={disabled}
        />
      )}

      {param.fieldtype === 'Select' && (
        <Select
          value={value || ''}
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${param.label}`} />
          </SelectTrigger>
          <SelectContent>
            {param.options?.split('\n').map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {(param.fieldtype === 'Data' || param.fieldtype === 'Int') && (
        <Input
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          type={param.fieldtype === 'Int' ? 'number' : 'text'}
          name={param.fieldname}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export interface ParamFormProps {
  params: HazelNodeParam[];
  values: Record<string, string>;
  onChange: (fieldname: string, value: string) => void;
  disabled?: boolean;
}

export function ParamForm({
  params,
  values,
  onChange,
  disabled = false,
}: ParamFormProps) {
  return (
    <>
      {params.map((param) => (
        <ParamField
          key={param.fieldname}
          param={param}
          value={values[param.fieldname] || ''}
          onChange={onChange}
          disabled={disabled}
        />
      ))}
    </>
  );
}
