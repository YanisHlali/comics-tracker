import React, { useCallback, useMemo } from "react";
import TextInputFilter from "@/components/TextInputFilter";
import ReadingNumberFilter from "@/components/ReadingNumberFilter";
import FrenchEditionStyleSelector from "@/components/FrenchEditionStyleSelector";
import useMobileBreakpoint from "@/hooks/useMobileBreakpoint";

const FilterButton = React.memo(({ onClick, showActiveFilters, isOpen }) => (
  <button
    onClick={onClick}
    className="mb-4 bg-marvelRed text-white px-4 py-2 rounded"
  >
    {isOpen ? `Cacher les filtres ${showActiveFilters}` : `Afficher les filtres ${showActiveFilters}`}
  </button>
));

const FilterActions = React.memo(({ onFilterIssuesWithoutFrenchEdition, onResetFilter }) => (
  <div className="mt-4 flex flex-wrap gap-4">
    <button
      onClick={onFilterIssuesWithoutFrenchEdition}
      className="px-4 py-2 bg-marvelRed text-white rounded-md hover:bg-red-600"
      type="button"
    >
      Afficher les issues sans éditions françaises
    </button>
    <button
      onClick={onResetFilter}
      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      type="button"
    >
      Réinitialiser le filtre
    </button>
  </div>
));

const Filters = ({
  showFilters,
  toggleFilters,
  searchTitle,
  setSearchTitle,
  searchWriter,
  setSearchWriter,
  searchPenciller,
  setSearchPenciller,
  minReadingNumber,
  setMinReadingNumber,
  maxReadingNumber,
  setMaxReadingNumber,
  frenchEditionStyle,
  setFrenchEditionStyle,
  filterIssuesWithoutFrenchEdition,
  resetFilter,
}) => {
  const isMobile = useMobileBreakpoint(640);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = React.useState(false);


  const activeFilters = useMemo(() => [
    searchTitle, searchWriter, searchPenciller, minReadingNumber, maxReadingNumber
  ].filter(Boolean).length, [searchTitle, searchWriter, searchPenciller, minReadingNumber, maxReadingNumber]);
  const showActiveFilters = activeFilters > 0 ? `(${activeFilters})` : "";

  const handleReset = useCallback(() => resetFilter(), [resetFilter]);
  const handleToggleDialog = useCallback(() => {
    toggleFilters();
    setIsDialogFilterOpen(prev => !prev);
  }, [toggleFilters]);

  return (
    <div className="p-4">
      <FilterButton
        onClick={handleToggleDialog}
        showActiveFilters={showActiveFilters}
        isOpen={isDialogFilterOpen}
      />
      {showFilters && (
        <>
          <TextInputFilter
            id="title"
            label="Titre"
            value={searchTitle}
            setValue={setSearchTitle}
            placeholder="Rechercher par titre"
          />

          {!isMobile && (
            <>
              <TextInputFilter
                id="writer"
                label="Auteur"
                value={searchWriter}
                setValue={setSearchWriter}
                placeholder="Rechercher par auteur"
              />
              <TextInputFilter
                id="penciller"
                label="Dessinateur"
                value={searchPenciller}
                setValue={setSearchPenciller}
                placeholder="Rechercher par dessinateur"
              />
              <ReadingNumberFilter
                id="minReadingNumber"
                label="Numéro de lecture minimum"
                value={minReadingNumber}
                setValue={setMinReadingNumber}
              />
              <ReadingNumberFilter
                id="maxReadingNumber"
                label="Numéro de lecture maximum"
                value={maxReadingNumber}
                setValue={setMaxReadingNumber}
              />
              <FrenchEditionStyleSelector
                frenchEditionStyle={frenchEditionStyle}
                setFrenchEditionStyle={setFrenchEditionStyle}
              />
              <FilterActions
                onFilterIssuesWithoutFrenchEdition={filterIssuesWithoutFrenchEdition}
                onResetFilter={handleReset}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Filters;
