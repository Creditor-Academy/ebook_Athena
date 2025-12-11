import cover1 from '../assets/covers/book1.jpg'
import cover2 from '../assets/covers/book2.jpg'

export const ebooks = [
  {
    id: 'athena-rising',
    title: 'Athena Rising',
    author: 'Elena Moore',
    description: 'A thoughtful guide to modern learning and personal growth.',
    price: '$14.99',
    cover: cover1,
  },
  {
    id: 'code-calm',
    title: 'Code in the Calm',
    author: 'Jamal Ortiz',
    description: 'Mindful practices to level up your engineering craft.',
    price: '$12.50',
    cover: cover2,
  },
  {
    id: 'design-light',
    title: 'Design in the Light',
    author: 'Priya Menon',
    description: 'Human-centered design tips for clear, joyful products.',
    price: '$16.00',
    cover: 'https://via.placeholder.com/200x280/eed9c4/4a3624?text=eBook+Cover',
  },
  {
    id: 'story-maps',
    title: 'Story Maps',
    author: 'Arjun Das',
    description: 'Frameworks for plotting unforgettable narratives.',
    price: '$11.25',
    cover: 'https://via.placeholder.com/200x280/eed9c4/4a3624?text=eBook+Cover',
  },
  {
    id: 'fire-blood',
    title: 'Fire & Blood',
    author: 'G.R.R. Martin',
    description: 'The history of the Targaryen reign in Westeros.',
    price: '$18.00',
    cover: 'https://picsum.photos/seed/fireblood/400/560',
  },
]

export const purchasedEbooks = ebooks.slice(0, 3)

