// components/location-picker.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationOption {
  value: string;
  label: string;
}

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [options, setOptions] = React.useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Debounce the search
  React.useEffect(() => {
    if (searchValue.length < 2) {
      setOptions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchLocations(searchValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const searchLocations = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=10`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      const data = await response.json();

      const locationOptions: LocationOption[] = data
        .map((item: any) => {
          const city = item.address?.city || 
                       item.address?.town || 
                       item.address?.village || 
                       item.address?.municipality ||
                       item.name;
          
          const country = item.address?.country || 'Unknown';
          const state = item.address?.state;
          
          const label = state 
            ? `${city}, ${state}, ${country}` 
            : `${city}, ${country}`;
          
          return {
            value: label,
            label: label,
          };
        })
        .filter((item: LocationOption) => item.label && !item.label.includes('Unknown'));

      setOptions(locationOptions);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-50" />
              {value}
            </span>
          ) : (
            <span className="text-muted-foreground">Search for a city...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search cities..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Searching...</span>
                </div>
              ) : searchValue.length < 2 ? (
                <div className="py-6 text-center text-sm">
                  Type at least 2 characters to search
                </div>
              ) : (
                <div className="py-6 text-center text-sm">
                  No cities found
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <MapPin className="mr-2 h-4 w-4 opacity-50" />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}