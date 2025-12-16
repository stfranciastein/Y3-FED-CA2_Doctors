import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Grid, List, Plus, ArrowUpDown } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

export default function IndexToolbar({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder,
  addLink,
  addText,
  sortOrder,
  onSortToggle,
  viewMode,
  onViewToggle
}) {
  return (
    <div className="flex gap-2 mb-4">
      <SearchBar
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

      <Button asChild variant='outline'>
        <Link to={addLink}>
          <Plus size={18} className="md:mr-2" />
          <span className="hidden md:inline">{addText}</span>
        </Link>
      </Button>
      
      <Button
        variant='outline'
        onClick={onSortToggle}
        title={sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
      >
        <ArrowUpDown size={18} />
      </Button>

      <Button
        variant='outline'
        onClick={onViewToggle}
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
