
'use client';

import { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CourseFilters as CourseFiltersType, CourseType } from '@/lib/types';

interface CourseFiltersProps {
  filters: CourseFiltersType;
  onFiltersChange: (filters: CourseFiltersType) => void;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function CourseFilters({ filters, onFiltersChange, categories }: CourseFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput });
  };

  const handleFilterChange = (key: keyof CourseFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchInput('');
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6 p-6 bg-muted/50 rounded-lg">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск курсов..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Найти</Button>
      </form>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category filter */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value as CourseType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип обучения" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="QUALIFICATION">Повышение квалификации</SelectItem>
            <SelectItem value="DIPLOMA">Диплом</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">По дате</SelectItem>
            <SelectItem value="title">По алфавиту</SelectItem>
            <SelectItem value="hours">По часам</SelectItem>
            <SelectItem value="price">По цене</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort order */}
        <Button
          variant="outline"
          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2"
        >
          {filters.sortOrder === 'asc' ? (
            <>
              <SortAsc className="h-4 w-4" />
              По возрастанию
            </>
          ) : (
            <>
              <SortDesc className="h-4 w-4" />
              По убыванию
            </>
          )}
        </Button>
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Активные фильтры:</span>
          {filters.search && (
            <Badge variant="secondary">
              Поиск: {filters.search}
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary">
              Категория: {categories.find(c => c.slug === filters.category)?.name}
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary">
              {filters.type === 'QUALIFICATION' ? 'Повышение квалификации' : 'Диплом'}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-1" />
            Очистить все
          </Button>
        </div>
      )}
    </div>
  );
}
