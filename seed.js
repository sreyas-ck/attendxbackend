const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Class = require('./src/models/Class');
const Subject = require('./src/models/Subject');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  await User.deleteMany({});
  await Class.deleteMany({});
  await Subject.deleteMany({});

  const subjects = await Subject.insertMany([
   
    { name: 'Python', code: 'PY', description: 'Python programming from basics to advanced' },
    { name: 'Flutter', code: 'FLT', description: 'Cross-platform mobile app development with Flutter' },
    { name: 'MERN Stack', code: 'MERN', description: 'MongoDB, Express, React and Node.js full stack development' },
    { name: 'React', code: 'REACT', description: 'Modern frontend development with React.js' },
    { name: 'PHP', code: 'PHP', description: 'Server-side web development with PHP' },
    { name: 'Data Science', code: 'DS', description: 'Data analysis, visualization and machine learning' },
    { name: 'AI & ML', code: 'AIML', description: 'Artificial Intelligence and Machine Learning concepts' },
    { name: 'Cybersecurity', code: 'CYBER', description: 'Network security, ethical hacking and cyber defense' },
    { name: 'UI/UX', code: 'UIUX', description: 'User interface and user experience design' },
    { name: 'DevOps', code: 'DEVOPS', description: 'CI/CD, Docker, Kubernetes and cloud infrastructure' },
  ]);
  console.log('✅ Subjects created');

  const admin = await User.create({
    name: 'Sreyas',
    email: 'sreyas@cybersquare.com',
    password: 'admin123',
    role: 'admin'
  });

  const teacher1 = await User.create({
    name: 'Ajina',
    email: 'ajina@cybersquare.com',
    password: 'teacher123',
    role: 'teacher'
  });

  const teacher2 = await User.create({
    name: 'Sarah Johnson',
    email: 'sarah@cybersquare.com',
    password: 'teacher123',
    role: 'teacher'
  });

  const class1 = await Class.create({
    name: 'Batch A',
    section: '2025',
    teacher: teacher1._id,
    subjects: subjects.map(s => s._id),
    academicYear: '2025'
  });

  const class2 = await Class.create({
    name: 'Batch B',
    section: '2025',
    teacher: teacher2._id,
    subjects: subjects.map(s => s._id),
    academicYear: '2025'
  });

  teacher1.assignedClasses = [class1._id];
  teacher2.assignedClasses = [class2._id];
  await teacher1.save();
  await teacher2.save();

  console.log('✅ Batches and Courses created');
  console.log('\n🔑 Login Credentials:');
  console.log('Admin   → sreyas@cybersquare.com / admin123');
  console.log('Teacher → ajina@cybersquare.com / teacher123');

  await mongoose.disconnect();
  console.log('\n✅ Seed complete!');
};

seed().catch(err => { console.error(err); process.exit(1); });