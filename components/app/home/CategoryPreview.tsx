"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import { AppCard } from "@/components/app/AppCard";

import { formatINR} from "@/features/transactions/lib/formatters";
import { categoryColor, categoryIcon } from "@/features/transactions/lib/categories";

type Category = {
  name: string;
  value: number;
};

type Props = {
  categories: Category[];
};

export default function CategoryPreview({
  categories,
}: Props) {
  const topCategories = categories.slice(0, 5);

  return (
    <AppCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Categories
          </h3>

          <p className="text-[11px] text-gray-400">
            Spending distribution
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-40 w-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topCategories}
                dataKey="value"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={3}
                strokeWidth={0}
              >
                {topCategories.map((_, index) => (
                  <Cell
                    key={index}
                    fill={categoryColor(index)}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {topCategories.map((category, index) => (
            <div
              key={category.name}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                  style={{
                    backgroundColor: `${categoryColor(index)}18`,
                  }}
                >
                  {categoryIcon(category.name)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-700">
                    {category.name}
                  </p>

                  <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (category.value /
                            topCategories[0].value) *
                            100
                        )}%`,
                        backgroundColor: categoryColor(index),
                      }}
                    />
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-gray-700">
                {formatINR(category.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  );
}