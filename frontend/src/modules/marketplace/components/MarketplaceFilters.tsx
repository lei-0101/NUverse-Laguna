import { useState } from 'react'
import { Button, Input, Select } from '@/shared/components/ui'
import { categoryOptions, conditionOptions } from '../schemas'
import type { ListingCategory, ListingCondition, ListingFilters } from '../types'

interface MarketplaceFiltersProps {
  initial: ListingFilters
  onApply: (filters: ListingFilters) => void
}

/**
 * Controlled browse filters. Builds a clean {@link ListingFilters} (omitting
 * blank fields) and emits it on submit, so empty inputs never become query params.
 */
export function MarketplaceFilters({ initial, onApply }: MarketplaceFiltersProps) {
  const [keyword, setKeyword] = useState(initial.keyword ?? '')
  const [category, setCategory] = useState<string>(initial.category ?? '')
  const [condition, setCondition] = useState<string>(initial.condition ?? '')
  const [minPrice, setMinPrice] = useState(initial.minPrice?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice?.toString() ?? '')

  const buildFilters = (): ListingFilters => {
    const filters: ListingFilters = {}
    if (keyword.trim()) filters.keyword = keyword.trim()
    if (category) filters.category = category as ListingCategory
    if (condition) filters.condition = condition as ListingCondition
    if (minPrice.trim()) filters.minPrice = Number(minPrice)
    if (maxPrice.trim()) filters.maxPrice = Number(maxPrice)
    return filters
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onApply(buildFilters())
  }

  const handleReset = () => {
    setKeyword('')
    setCategory('')
    setCondition('')
    setMinPrice('')
    setMaxPrice('')
    onApply({})
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Marketplace filters"
      className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="lg:col-span-2">
        <Input
          label="Search"
          placeholder="Search listings…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <Select
        label="Category"
        placeholder="All categories"
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <Select
        label="Condition"
        placeholder="Any condition"
        options={conditionOptions}
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
      />
      <Input
        label="Min price"
        type="number"
        min={0}
        inputMode="decimal"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
      />
      <Input
        label="Max price"
        type="number"
        min={0}
        inputMode="decimal"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
        <Button type="submit">Apply filters</Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </form>
  )
}
