import React from 'react';
import SearchFilter from './Filters/SearchFilter';
import NumberFilter from './Filters/NumberFilter';
import SelectFilter from './Filters/SelectFilter';
import CheckboxFilter from './Filters/CheckboxFilter';
import FilterHeader from './Filters/FilterHeader';
import FilterActions from './Filters/FilterActions';
import FilterSection from './Filters/FilterSection';
import useFilterState from '@/hooks/useFilterState';

interface SimpleFiltersProps {
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  filterIssuesWithoutFrenchEdition: () => void;
}

export default function SimpleFilters({ 
  filters,
  setFilter,
  resetFilters,
  filterIssuesWithoutFrenchEdition
}: SimpleFiltersProps): React.ReactElement {
  const { showFilters, activeFiltersCount, handleToggleFilters } = useFilterState(filters);

  const styleOptions = [
    { value: 'color', label: 'Couleur' },
    { value: 'gray', label: 'Gris' }
  ];

  if (!showFilters) {
    return (
      <FilterHeader
        activeFiltersCount={activeFiltersCount}
        onToggle={() => handleToggleFilters(setFilter)}
        isExpanded={false}
      />
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg mb-4" role="region" aria-label="Filtres de recherche">
      <FilterHeader
        activeFiltersCount={activeFiltersCount}
        onToggle={() => handleToggleFilters(setFilter)}
        isExpanded={true}
      />
      
      <FilterSection title="Critères de recherche">
        <SearchFilter
          label="Titre"
          value={filters.searchTitle as string}
          onChange={(value: string) => setFilter('searchTitle', value)}
          placeholder="Rechercher par titre..."
        />

        <SearchFilter
          label="Scénariste"
          value={filters.searchWriter as string}
          onChange={(value: string) => setFilter('searchWriter', value)}
          placeholder="Rechercher par scénariste..."
        />

        <SearchFilter
          label="Dessinateur"
          value={filters.searchPenciller as string}
          onChange={(value: string) => setFilter('searchPenciller', value)}
          placeholder="Rechercher par dessinateur..."
        />

        <NumberFilter
          label="Numéro min"
          value={filters.minReadingNumber as number}
          onChange={(value: number | null) => setFilter('minReadingNumber', value)}
          placeholder="Numéro minimum..."
          min={1}
          max={9999}
        />

        <NumberFilter
          label="Numéro max"
          value={filters.maxReadingNumber as number}
          onChange={(value: number | null) => setFilter('maxReadingNumber', value)}
          placeholder="Numéro maximum..."
          min={1}
          max={9999}
        />

        <SelectFilter
          label="Style édition française"
          value={filters.frenchEditionStyle as string || 'color'}
          onChange={(value: string) => setFilter('frenchEditionStyle', value)}
          options={styleOptions as Array<{ value: string; label: string }>}
        />
      </FilterSection>

      <div className="mt-4">
        <CheckboxFilter
          label="Sans édition française uniquement"
          checked={filters.onlyWithoutFrenchEdition}
          onChange={(checked: boolean) => setFilter('onlyWithoutFrenchEdition', checked)}
        />
      </div>
      
      <FilterActions
        onFilterWithoutFrench={filterIssuesWithoutFrenchEdition}
        onReset={resetFilters}
      />
    </div>
  );
}