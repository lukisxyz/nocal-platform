export const PROFESSIONAL_FIELDS = [
  'Software Engineering',
  'Product Management',
  'Design (UI/UX)',
  'Data Science',
  'DevOps & Infrastructure',
  'Cybersecurity',
  'AI/ML Engineering',
  'Mobile Development',
  'Web Development',
  'Cloud Architecture',
  'Blockchain Development',
  'Game Development',
  'Technical Writing',
  'Digital Marketing',
  'Business Strategy',
  'Project Management',
  'Entrepreneurship',
  'Finance & Investment',
  'Sales & Business Development',
  'Customer Success',
  'Content Creation',
  'Social Media Marketing',
  'SEO/SEM',
  'E-commerce',
  'Video Production',
  'Photography',
  'Music Production',
  '3D Animation',
  'VFX & Motion Graphics',
  'NFTs & Crypto',
  'Web3 Development',
  'Smart Contract Development',
] as const;

export type ProfessionalField = typeof PROFESSIONAL_FIELDS[number];

export const BOOKING_TYPES = {
  FREE: 'FREE',
  PAID: 'PAID',
  COMMITMENT: 'COMMITMENT',
} as const;

export type BookingType = typeof BOOKING_TYPES[keyof typeof BOOKING_TYPES];

export const TOKEN_TYPES = {
  USDC: 'USDC',
  USDT: 'USDT',
  MOCK_USDC: 'mockUSDC',
  MOCK_USDT: 'mockUSDT',
} as const;

export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES];

export const SESSION_DURATIONS = [15, 30, 45] as const;

export const TIME_BREAKS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60] as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
