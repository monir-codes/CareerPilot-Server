import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CareerPath } from './models/CareerPath.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

const seedData = [
  { 
    title: 'Software Engineer', 
    category: 'Engineering', 
    salary: '$120k - $180k', 
    exp: 'Mid-Level', 
    location: 'Remote', 
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', 
    description: 'Design, develop, and maintain software systems. Work closely with cross-functional teams to deliver high-quality products.', 
    skills: ['JavaScript', 'React', 'Node.js', 'System Design', 'Algorithms'],
    tags: ['Tech', 'Coding', 'Development']
  },
  { 
    title: 'Product Manager', 
    category: 'Product', 
    salary: '$130k - $160k', 
    exp: 'Senior', 
    location: 'New York, NY', 
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80', 
    description: 'Lead the strategy and execution of product development from ideation to launch.', 
    skills: ['Agile', 'Roadmapping', 'User Research', 'Data Analysis', 'Stakeholder Management'],
    tags: ['Leadership', 'Strategy', 'Business']
  },
  { 
    title: 'UX Designer', 
    category: 'Design', 
    salary: '$90k - $140k', 
    exp: 'Entry-Level', 
    location: 'Remote', 
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80', 
    description: 'Create intuitive, beautiful, and accessible user interfaces that solve complex problems.', 
    skills: ['Figma', 'Prototyping', 'User Testing', 'Wireframing', 'Visual Design'],
    tags: ['Creative', 'Design', 'UI/UX']
  },
  { 
    title: 'Data Scientist', 
    category: 'Data', 
    salary: '$140k - $200k', 
    exp: 'Senior', 
    location: 'San Francisco, CA', 
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 
    description: 'Extract insights from massive datasets to drive business decisions and predictive models.', 
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
    tags: ['Analytics', 'AI', 'Big Data']
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');
    
    console.log('Clearing old CareerPath data...');
    await CareerPath.deleteMany({});
    
    console.log('Inserting seed data...');
    await CareerPath.insertMany(seedData);
    
    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
