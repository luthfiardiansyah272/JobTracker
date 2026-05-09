// Default user profile
const DEFAULT_PROFILE = {
  name: '',
  title: '',
  experience: 0, // tahun
  skills: [],
  preferredRoles: [],
  preferredLocations: [],
  preferredSalaryMin: 0,
  preferredSalaryMax: 0,
  workType: 'any', // remote, onsite, hybrid, any
  jobLevel: 'any', // fresh, junior, mid, senior, any
  industries: [],
};

// Job database untuk rekomendasi
const JOB_DATABASE = [
  // Tech - Frontend
  { id: 'j1', title: 'Frontend Developer', company: 'Tokopedia', location: 'Jakarta', salaryMin: 12, salaryMax: 20, skills: ['javascript','react','html','css','typescript'], level: 'mid', workType: 'hybrid', industry: 'ecommerce', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer+Tokopedia', hot: true },
  { id: 'j2', title: 'React Developer', company: 'Gojek', location: 'Jakarta', salaryMin: 15, salaryMax: 25, skills: ['react','javascript','typescript','redux','nodejs'], level: 'mid', workType: 'hybrid', industry: 'tech', source: 'glints', url: 'https://glints.com/id/opportunities/jobs/explore?keyword=React+Developer', hot: true },
  { id: 'j3', title: 'Junior Frontend Developer', company: 'Bukalapak', location: 'Bandung', salaryMin: 7, salaryMax: 12, skills: ['html','css','javascript','vue'], level: 'junior', workType: 'onsite', industry: 'ecommerce', source: 'jobstreet', url: 'https://www.jobstreet.co.id/id/jobs?q=Junior+Frontend+Developer', hot: false },
  { id: 'j4', title: 'Senior Frontend Engineer', company: 'Traveloka', location: 'Jakarta', salaryMin: 25, salaryMax: 40, skills: ['react','typescript','graphql','testing','performance'], level: 'senior', workType: 'hybrid', industry: 'travel', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Senior+Frontend+Engineer', hot: true },
  { id: 'j5', title: 'Vue.js Developer', company: 'Tiket.com', location: 'Jakarta', salaryMin: 10, salaryMax: 18, skills: ['vue','javascript','css','nuxt'], level: 'mid', workType: 'hybrid', industry: 'travel', source: 'kalibrr', url: 'https://www.kalibrr.id/id-ID/job-board#q=Vue+Developer', hot: false },

  // Tech - Backend
  { id: 'j6', title: 'Backend Developer', company: 'Shopee', location: 'Jakarta', salaryMin: 15, salaryMax: 28, skills: ['golang','python','mysql','redis','microservices'], level: 'mid', workType: 'onsite', industry: 'ecommerce', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Backend+Developer+Shopee', hot: true },
  { id: 'j7', title: 'Node.js Developer', company: 'Dana', location: 'Jakarta', salaryMin: 12, salaryMax: 22, skills: ['nodejs','javascript','mongodb','express','docker'], level: 'mid', workType: 'hybrid', industry: 'fintech', source: 'glints', url: 'https://glints.com/id/opportunities/jobs/explore?keyword=NodeJS+Developer', hot: false },
  { id: 'j8', title: 'Laravel Developer', company: 'Blibli', location: 'Jakarta', salaryMin: 8, salaryMax: 15, skills: ['php','laravel','mysql','rest api'], level: 'junior', workType: 'onsite', industry: 'ecommerce', source: 'jobstreet', url: 'https://www.jobstreet.co.id/id/jobs?q=Laravel+Developer', hot: false },
  { id: 'j9', title: 'Senior Backend Engineer', company: 'OVO', location: 'Jakarta', salaryMin: 28, salaryMax: 45, skills: ['java','spring boot','kafka','microservices','kubernetes'], level: 'senior', workType: 'hybrid', industry: 'fintech', source: 'talentics', url: 'https://talentics.id/jobs?q=Senior+Backend+Engineer', hot: true },
  { id: 'j10', title: 'Python Developer', company: 'Kredivo', location: 'Jakarta', salaryMin: 12, salaryMax: 20, skills: ['python','django','postgresql','celery'], level: 'mid', workType: 'remote', industry: 'fintech', source: 'kalibrr', url: 'https://www.kalibrr.id/id-ID/job-board#q=Python+Developer', hot: false },

  // Tech - Fullstack
  { id: 'j11', title: 'Full Stack Developer', company: 'Grab', location: 'Jakarta', salaryMin: 18, salaryMax: 30, skills: ['react','nodejs','typescript','postgresql','docker'], level: 'mid', workType: 'hybrid', industry: 'tech', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Developer+Grab', hot: true },
  { id: 'j12', title: 'Junior Full Stack', company: 'Startup Lokal', location: 'Remote', salaryMin: 6, salaryMax: 12, skills: ['javascript','react','nodejs','mongodb'], level: 'junior', workType: 'remote', industry: 'tech', source: 'glints', url: 'https://glints.com/id/opportunities/jobs/explore?keyword=Junior+Full+Stack', hot: false },

  // Data
  { id: 'j13', title: 'Data Analyst', company: 'Telkom Indonesia', location: 'Jakarta', salaryMin: 8, salaryMax: 15, skills: ['sql','python','excel','tableau','statistics'], level: 'junior', workType: 'onsite', industry: 'telco', source: 'jobstreet', url: 'https://www.jobstreet.co.id/id/jobs?q=Data+Analyst', hot: false },
  { id: 'j14', title: 'Data Scientist', company: 'GoTo', location: 'Jakarta', salaryMin: 20, salaryMax: 35, skills: ['python','machine learning','tensorflow','sql','statistics'], level: 'mid', workType: 'hybrid', industry: 'tech', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+GoTo', hot: true },
  { id: 'j15', title: 'Data Engineer', company: 'Traveloka', location: 'Jakarta', salaryMin: 18, salaryMax: 30, skills: ['python','spark','airflow','sql','bigquery'], level: 'mid', workType: 'hybrid', industry: 'travel', source: 'talentics', url: 'https://talentics.id/jobs?q=Data+Engineer', hot: true },
  { id: 'j16', title: 'Business Intelligence Analyst', company: 'Astra', location: 'Jakarta', salaryMin: 10, salaryMax: 18, skills: ['sql','tableau','power bi','excel','statistics'], level: 'junior', workType: 'onsite', industry: 'automotive', source: 'karir', url: 'https://www.karir.com/search/jobs?q=Business+Intelligence', hot: false },

  // Mobile
  { id: 'j17', title: 'Android Developer', company: 'BCA Digital', location: 'Jakarta', salaryMin: 15, salaryMax: 25, skills: ['kotlin','android','java','retrofit','mvvm'], level: 'mid', workType: 'hybrid', industry: 'banking', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Android+Developer', hot: true },
  { id: 'j18', title: 'Flutter Developer', company: 'Jenius', location: 'Jakarta', salaryMin: 12, salaryMax: 22, skills: ['flutter','dart','firebase','rest api'], level: 'mid', workType: 'hybrid', industry: 'banking', source: 'glints', url: 'https://glints.com/id/opportunities/jobs/explore?keyword=Flutter+Developer', hot: false },
  { id: 'j19', title: 'iOS Developer', company: 'Mandiri', location: 'Jakarta', salaryMin: 18, salaryMax: 30, skills: ['swift','ios','xcode','objective-c'], level: 'mid', workType: 'onsite', industry: 'banking', source: 'jobstreet', url: 'https://www.jobstreet.co.id/id/jobs?q=iOS+Developer', hot: false },

  // Design
  { id: 'j20', title: 'UI/UX Designer', company: 'Tokopedia', location: 'Jakarta', salaryMin: 10, salaryMax: 20, skills: ['figma','sketch','prototyping','user research','design system'], level: 'mid', workType: 'hybrid', industry: 'ecommerce', source: 'glints', url: 'https://glints.com/id/opportunities/jobs/explore?keyword=UI+UX+Designer', hot: true },
  { id: 'j21', title: 'Product Designer', company: 'Gojek', location: 'Jakarta', salaryMin: 15, salaryMax: 28, skills: ['figma','user research','prototyping','design thinking'], level: 'mid', workType: 'hybrid', industry: 'tech', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Gojek', hot: true },
  { id: 'j22', title: 'Junior UI Designer', company: 'Agency Digital', location: 'Remote', salaryMin: 5, salaryMax: 10, skills: ['figma','adobe xd','css','html'], level: 'junior', workType: 'remote', industry: 'agency', source: 'kalibrr', url: 'https://www.kalibrr.id/id-ID/job-board#q=Junior+UI+Designer', hot: false },

  // Product
  { id: 'j23', title: 'Product Manager', company: 'Shopee', location: 'Jakarta', salaryMin: 20, salaryMax: 40, skills: ['product management','agile','scrum','data analysis','roadmap'], level: 'mid', workType: 'onsite', industry: 'ecommerce', source: 'linkedin', url: 'https://www.linkedin.com/jobs/search/?keywords=Product+Manager+Shopee', hot: true },
  { id: 'j24', title: 'Associate Product Manager', company: 'Startup', location: 'Jakarta', salaryMin: 10, salaryMax: 18, skills: ['product management','agile','user research','analytics'], level: 'junior', workType: 'hybrid', industry: 'tech', source: 'glints', url: 'https://glints.com/id/opportunities/jobs/explore?keyword=Associate+Product+Manager', hot: false },

  // DevOps / Cloud
  { id: 'j25', title: 'DevOps Engineer', company: 'Gojek', location: 'Jakarta', salaryMin: 20, salaryMax: 35, skills: ['docker','kubernetes','aws','ci/cd','terraform'], level: 'mid', workType: 'hybrid', industry: 'tech', source: 'talentics', url: 'https://talentics.id/jobs?q=DevOps+Engineer', hot: true },
  { id: 'j26', title: 'Cloud Engineer', company: 'Telkom', location: 'Jakarta', salaryMin: 15, salaryMax: 28, skills: ['aws','gcp','azure','terraform','linux'], level: 'mid', workType: 'onsite', industry: 'telco', source: 'jobstreet', url: 'https://www.jobstreet.co.id/id/jobs?q=Cloud+Engineer', hot: false },

  // QA
  { id: 'j27', title: 'QA Engineer', company: 'Traveloka', location: 'Jakarta', salaryMin: 10, salaryMax: 18, skills: ['testing','selenium','automation','api testing','jira'], level: 'mid', workType: 'hybrid', industry: 'travel', source: 'kalibrr', url: 'https://www.kalibrr.id/id-ID/job-board#q=QA+Engineer', hot: false },
  { id: 'j28', title: 'Software QA Tester', company: 'Startup', location: 'Remote', salaryMin: 7, salaryMax: 13, skills: ['manual testing','selenium','postman','jira'], level: 'junior', workType: 'remote', industry: 'tech', source: 'glints', url: 'https://glints.com/id/opportunities/jobs/explore?keyword=QA+Tester', hot: false },
];

const SKILL_CATEGORIES = {
  frontend: ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular', 'nextjs', 'nuxt', 'tailwind', 'bootstrap', 'sass', 'webpack'],
  backend: ['nodejs', 'python', 'java', 'php', 'golang', 'ruby', 'laravel', 'django', 'spring boot', 'express', 'fastapi', 'rest api', 'graphql'],
  mobile: ['flutter', 'dart', 'kotlin', 'android', 'swift', 'ios', 'react native', 'java'],
  database: ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'firebase', 'sql', 'bigquery'],
  devops: ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'terraform', 'linux', 'nginx'],
  data: ['python', 'sql', 'tableau', 'power bi', 'excel', 'machine learning', 'tensorflow', 'spark', 'airflow', 'statistics'],
  design: ['figma', 'sketch', 'adobe xd', 'prototyping', 'user research', 'design system', 'design thinking'],
  product: ['product management', 'agile', 'scrum', 'roadmap', 'analytics', 'user research'],
};

const LEVEL_YEARS = { fresh: 0, junior: [0, 2], mid: [2, 5], senior: [5, 99], any: [0, 99] };
