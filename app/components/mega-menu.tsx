
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, GraduationCap, Shield, Flame, Heart, Wrench, Stethoscope } from 'lucide-react';
import { Category } from '@/lib/types';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const iconMap = {
  'GraduationCap': GraduationCap,
  'Shield': Shield,
  'Flame': Flame,
  'Heart': Heart,
  'Wrench': Wrench,
  'Stethoscope': Stethoscope,
};

export function MegaMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Загрузка...</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Обучение
            <ChevronDown className="h-4 w-4" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[800px] grid-cols-2 gap-6 p-6">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap] || GraduationCap;
                
                return (
                  <div key={category.id} className="space-y-3">
                    <Link
                      href={`/obuchenie/${category.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                        {category._count && (
                          <p className="text-xs text-primary font-medium mt-1">
                            {category._count.courses} курсов
                          </p>
                        )}
                      </div>
                    </Link>
                    
                    {category.children && category.children.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/obuchenie/${child.slug}`}
                            className="block p-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                          >
                            {child.name}
                            {child._count && (
                              <span className="ml-2 text-xs">({child._count.courses})</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="border-t p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <Link
                  href="/courses"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Все курсы →
                </Link>
                <Link
                  href="/dokumenty"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Документы по ОТ
                </Link>
                <Link
                  href="/sout"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  СОУТ
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
