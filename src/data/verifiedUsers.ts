export interface VerifiedUser {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
}

export const verifiedUsers: VerifiedUser[] = [
  {
    username: 'chefmarco',
    displayName: 'Chef Marco',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    bio: 'Italian chef sharing classic recipes and modern twists.'
  },
  {
    username: 'greenchefsarah',
    displayName: 'Green Chef Sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    bio: 'Plant-based cooking, sustainable eating, vibrant flavors.'
  },
  {
    username: 'breakfastking',
    displayName: 'Breakfast King',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    bio: 'All things breakfast, from eggs to pancakes.'
  },
  {
    username: 'sweetbaker',
    displayName: 'Sweet Baker',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    bio: 'Cookies, cakes, and everything sweet.'
  }
];


