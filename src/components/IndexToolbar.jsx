import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Grid, List, Plus, ArrowUpDown, Check } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function IndexToolbar({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder,
  addLink,
  addText,
  sortField,
  sortOrder,
  onSortChange,
  sortOptions = [],
  viewMode,
  onViewToggle
}) {
  return (
    <div className="flex gap-2 mb-4">
      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

      {/* Add Resource Button */}
      <Button asChild variant='outline'>
        <Link to={addLink}>
          <Plus size={18} className="md:mr-2" />
          <span className="hidden md:inline">{addText}</span>
        </Link>
      </Button>
      
      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            title="Sort options"
          >
            <ArrowUpDown size={18} className="md:mr-2" />
            <span className="hidden md:inline">Sort</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortChange(option.value, sortField === option.value && sortOrder === 'asc' ? 'desc' : 'asc')}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                <div className="flex items-center gap-1">
                  {sortField === option.value && (
                    <>
                      <Check size={16} className="text-teal-600" />
                      <span className="text-xs text-muted-foreground">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Mode Toggle */}
      <Button
        variant='outline'
        onClick={onViewToggle}
        title={viewMode === 'table' ? 'Switch to cards' : 'Switch to table'}
      >
        {viewMode === 'table' ? (
          <Grid size={18} />
        ) : (
          <List size={18} />
        )}
      </Button>
    </div>
  );
}
