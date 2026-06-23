import mongoose from 'mongoose';
import { CareerPath } from './src/models/CareerPath.model';
import { env } from './src/config/env';

const careers = [
  {
    title: 'Senior Full Stack Developer',
    description: 'Build scalable web applications from frontend user interfaces to robust backend databases. Architect systems, lead teams, and implement complex features using modern frameworks like React and Node.js.',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'System Design', 'AWS'],
    salary: '$130k - $180k',
    exp: '5+ Years',
    category: 'Engineering',
    location: 'Remote / Hybrid',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tags: ['High Demand', 'Remote Friendly']
  },
  {
    title: 'Machine Learning Engineer',
    description: 'Design, build, and deploy machine learning models that solve complex real-world problems. Work heavily with large datasets, neural networks, and Python ecosystems to bring AI to production.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Data Pipelines'],
    salary: '$140k - $200k',
    exp: '3+ Years',
    category: 'Engineering',
    location: 'Hybrid / On-site',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee57d5?auto=format&fit=crop&w=800&q=80',
    tags: ['AI/ML', 'Fastest Growing']
  },
  {
    title: 'Product Designer (UI/UX)',
    description: 'Craft intuitive, beautiful, and user-centric digital experiences. Conduct user research, create wireframes, design high-fidelity mockups, and prototype complex flows to delight users.',
    skills: ['Figma', 'Prototyping', 'User Research', 'Wireframing', 'CSS'],
    salary: '$90k - $150k',
    exp: '2-5 Years',
    category: 'Design',
    location: 'Remote',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    tags: ['Creative', 'Highly Collaborative']
  },
  {
    title: 'Data Scientist',
    description: 'Extract actionable insights from massive datasets to drive strategic business decisions. Utilize statistical modeling, A/B testing, and data visualization tools to communicate findings to stakeholders.',
    skills: ['Python', 'R', 'SQL', 'Tableau', 'Statistics', 'A/B Testing'],
    salary: '$110k - $160k',
    exp: '3+ Years',
    category: 'Data',
    location: 'Remote / Hybrid',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tags: ['Analytical', 'High Impact']
  },
  {
    title: 'Product Manager',
    description: 'Own the product lifecycle from ideation to launch. Bridge the gap between engineering, design, and business teams to ensure the right features are built at the right time.',
    skills: ['Agile', 'Jira', 'Roadmapping', 'Data Analysis', 'Leadership'],
    salary: '$120k - $170k',
    exp: '4+ Years',
    category: 'Product',
    location: 'Remote',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    tags: ['Leadership', 'Cross-Functional']
  },
  {
    title: 'Growth Marketing Manager',
    description: 'Drive user acquisition and revenue growth through data-driven marketing campaigns. Optimize funnels, run experiments, and manage paid advertising budgets across multiple channels.',
    skills: ['SEO/SEM', 'Google Ads', 'Data Analytics', 'Copywriting', 'A/B Testing'],
    salary: '$85k - $140k',
    exp: '3-6 Years',
    category: 'Marketing',
    location: 'Remote',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tags: ['Metrics Driven', 'Fast Paced']
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...', env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected.');

    await CareerPath.deleteMany({});
    console.log('Cleared existing careers.');

    await CareerPath.insertMany(careers);
    console.log(`Successfully seeded ${careers.length} careers!`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
