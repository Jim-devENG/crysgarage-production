import { User, Post } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Producer',
    avatar: '/avatars/alex.jpg',
    username: 'alexproducer',
    role: 'premium',
    joinDate: '2023-01-15',
    posts: 45,
    followers: 1234,
    following: 567,
    badges: ['verified', 'producer', 'top-contributor']
  },
  {
    id: '2',
    name: 'Sarah Mixer',
    avatar: '/avatars/sarah.jpg',
    username: 'sarahmixer',
    role: 'moderator',
    joinDate: '2022-08-20',
    posts: 89,
    followers: 2345,
    following: 234,
    badges: ['moderator', 'mix-engineer', 'helpful']
  },
  {
    id: '3',
    name: 'Mike Beatmaker',
    avatar: '/avatars/mike.jpg',
    username: 'mikebeatmaker',
    role: 'member',
    joinDate: '2023-03-10',
    posts: 23,
    followers: 456,
    following: 789,
    badges: ['beatmaker', 'rising-star']
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Just finished mastering my new EP - Here\'s what I learned',
    content: 'After spending 3 months working on my latest EP, I finally finished the mastering process. The biggest lesson? Less is more when it comes to compression. I used the Advanced Tier dashboard and the results are incredible! Anyone else working on new music?',
    author: mockUsers[0],
    timestamp: '2 hours ago',
    likes: 45,
    comments: 12,
    shares: 8,
    views: 234,
    category: 'showcase',
    tags: ['mastering', 'ep', 'compression', 'advanced-tier'],
    isLiked: false,
    isBookmarked: false,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Best plugins for vocal processing?',
    content: 'I\'m working on a new track and need some recommendations for vocal processing plugins. Currently using the Free Tier but considering upgrading. What plugins do you swear by for vocals?',
    author: mockUsers[2],
    timestamp: '5 hours ago',
    likes: 23,
    comments: 18,
    shares: 3,
    views: 156,
    category: 'production',
    tags: ['vocals', 'plugins', 'processing', 'free-tier'],
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    title: 'Studio setup tour - My home recording space',
    content: 'Finally got my home studio set up exactly how I wanted it! Here\'s a tour of my space. The acoustic treatment made the biggest difference. Anyone else working from home?',
    author: mockUsers[1],
    timestamp: '1 day ago',
    likes: 67,
    comments: 25,
    shares: 15,
    views: 445,
    category: 'gear',
    tags: ['studio', 'setup', 'acoustic-treatment', 'home-recording'],
    media: {
      type: 'image',
      url: '/studio-setup.jpg',
      thumbnail: '/studio-setup-thumb.jpg'
    },
    isLiked: false,
    isBookmarked: true
  }
];
