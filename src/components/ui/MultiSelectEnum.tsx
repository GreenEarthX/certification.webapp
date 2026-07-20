"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label?: string;
};

type MultiSelectEnumProps = {
  options: MultiSelectOption[];
  value: string[]; // selected values
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

const TRIGGER_CLASS =
  "w-full justify-between bg-white text-black border border-gray-300";
const POPOVER_CLASS = "p-0 bg-white text-black border border-gray-300";

export function MultiSelectEnum({
  options,
  value,
  onChange,
  placeholder = "Select items",
  disabled = false,
}: MultiSelectEnumProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    setOpen(next);
  };

  const toggleValue = (v: string) => {
    if (disabled) return;
    if (value.includes(v)) {
      onChange(value.filter((item) => item !== v));
    } else {
      onChange([...value, v]);
    }
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const selectedOptions = options.filter((o) => value.includes(o.value));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={TRIGGER_CLASS}
            disabled={disabled}
          >
            <span className="truncate text-left">
              {selectedOptions.length === 0
                ? placeholder
                : `${selectedOptions.length} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={POPOVER_CLASS}>
          <Command className="bg-white text-black">
            <CommandInput
              placeholder="Search..."
              className="border-b border-gray-200"
            />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleValue(option.value)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{option.label ?? option.value}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {selectedOptions.map((option) => (
          <Badge
            key={option.value}
            variant="outline"
            className="flex items-center gap-1 border-gray-300 bg-white text-black"
          >
            <span className="text-xs">
              {option.label ?? option.value}
            </span>
            <button
              type="button"
              onClick={() => toggleValue(option.value)}
              className="flex items-center"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selectedOptions.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-blue-600 underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
