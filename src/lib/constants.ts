export const CATEGORIES = [
  "食費",
  "交通費",
  "住居費",
  "光熱費",
  "通信費",
  "医療費",
  "教育費",
  "娯楽費",
  "衣服費",
  "日用品",
  "交際費",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  食費: "#ef4444",
  交通費: "#f97316",
  住居費: "#eab308",
  光熱費: "#84cc16",
  通信費: "#22c55e",
  医療費: "#14b8a6",
  教育費: "#06b6d4",
  娯楽費: "#3b82f6",
  衣服費: "#8b5cf6",
  日用品: "#a855f7",
  交際費: "#ec4899",
  その他: "#6b7280",
};

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
