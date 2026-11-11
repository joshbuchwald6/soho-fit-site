// Curated, verified business content for the SOHO Fit site.
// Every fact here traces to the archive in ../content (see README in /site).
// Long-form trainer bios and FAQs are read straight from the archive JSON at build time.

export const business = {
  name: 'SOHO Fit',
  legalName: 'Soho Fit Tampa',
  phone: '813-586-0760',
  phoneHref: 'tel:+18135860760',
  smsHref: 'sms:+18135860760',
  email: 'benjamin@sohofittampa.com', // published on the original Privacy Policy page
  instagram: 'https://www.instagram.com/sohofittampa/',
  giftCards:
    'https://app.squareup.com/gift/ML73HJ66DEGFM/order?_savt=602c9cca-67f5-4c72-b161-8cf163a6f855&external_source=giveandgetlocal',
  googleReviews:
    'https://www.google.com/maps/place/Soho+Fit+Tampa/@27.9283688,-82.486507,17z/data=!4m8!3m7!1s0x88c2c335e6b36821:0xad0e725b989c20d8!8m2!3d27.9283641!4d-82.4839321!9m1!1b1!16s%2Fg%2F11thf400jq?entry=ttu',
  award: {
    label: 'Voted Best of South Tampa',
    detail: 'South Tampa Magazine · 2023, 2024 & 2025',
    href: 'https://tampamagazines.com/best-of-south-tampa-2023/',
  },
  hours: [
    ['Monday to Friday', '5:00am to 9:00pm'],
    ['Saturday and Sunday', 'By appointment'],
  ],
  policy: 'Please give 24 hours notice to cancel. Cancellations inside 24 hours are billed as a session.',
  siteUrl: 'https://sohofittampa.com',
};

export const studios = [
  {
    id: 'hyde-park',
    name: 'Hyde Park',
    tag: 'SoHo',
    street: '715 S Howard Ave',
    unit: 'Suites 100 & 130',
    city: 'Tampa, FL 33606',
    landmark: 'Next door to Starbucks',
    map: 'https://maps.app.goo.gl/z6nngr1ubRE4NdkP8',
    q: 'SOHO Fit, 715 S Howard Ave, Tampa, FL 33606',
    geo: { lat: 27.9283641, lng: -82.4839321 },
  },
  {
    id: 'westshore',
    name: 'Westshore',
    tag: 'Westshore & El Prado',
    street: '3431 S Westshore Blvd',
    unit: '',
    city: 'Tampa, FL 33629',
    landmark: 'At Westshore Blvd and El Prado',
    map: 'https://www.google.com/maps/search/?api=1&query=3431+S+Westshore+Blvd+Tampa+FL+33629',
    q: '3431 S Westshore Blvd, Tampa, FL 33629',
  },
];

// Services. `slug` is the new URL; `old` is the original URL path (for redirects).
export const services = [
  {
    slug: 'in-studio',
    old: ['/studio-personal-training/', '/portfolio-item/studio-personal-training/', '/portfolio-item/start/'],
    archive: 'studio-personal-training',
    name: 'In-Studio Training',
    short: 'One on one, in a private studio built for it.',
    index: 'Private 1-on-1 and partner sessions at Hyde Park or Westshore.',
    img: 'studio-floor',
    imgPos: '38% 50%',
    lede: 'A private studio, a dedicated trainer and a program written for you. No waiting for equipment, no one watching, nothing to figure out on your own.',
    blocks: [
      {
        h: 'It starts with an assessment',
        p: 'Your first visit is a consultation and fitness assessment. Your trainer learns where you are strong, where you need work, how you eat and how you train now. Then they write a program specific to you.',
      },
      {
        h: 'Then we get to work',
        p: 'Sessions combine cardio, strength and core. Your trainer watches every rep and adjusts the difficulty as you progress, with homework to keep you on track between sessions.',
      },
      {
        h: 'And we measure it',
        p: 'Regular InBody scans measure fat, muscle, bone and water by body segment, with results sent to an app on your phone. You see progress in real data, not guesses.',
      },
    ],
    facts: [
      ['Format', '1-on-1, or Partner Training with a friend or spouse'],
      ['Session length', '30, 45 or 60 minutes'],
      ['Where', 'Hyde Park (SoHo) or Westshore'],
    ],
  },
  {
    slug: 'at-home',
    old: ['/at-home-personal-training/', '/portfolio-item/at-home-personal-training/'],
    archive: 'at-home-personal-training',
    name: 'At-Home Training',
    short: 'Your trainer comes to you.',
    index: 'At your home or community gym, anywhere in the Tampa area.',
    img: 'svc-athome',
    imgPos: '50% 30%',
    lede: 'Sometimes life is too busy to get to the gym. So a SOHO Fit trainer meets you at an agreed time at your home or community gym, and brings equipment if you don’t have any.',
    blocks: [
      {
        h: 'A full session, wherever you are',
        p: 'Expect a thorough workout that combines cardio and strength, built around your specific goals. The same programming and accountability as the studio.',
      },
      {
        h: 'Get the whole family involved',
        p: 'Family Fitness sessions bring a trainer to your home, community gym or a public space with a workout designed around everyone: every age, level and ability. With a parent’s consent we work with children of all ages, from weight loss to sport-specific training.',
      },
    ],
    facts: [
      ['Format', '1-on-1 or Family Fitness'],
      ['Where', 'Your home, community gym or a public space'],
      ['Equipment', 'We bring it if you need it'],
    ],
  },
  {
    slug: 'corporate-wellness',
    old: ['/corporate-wellness/', '/portfolio-item/corporate-wellness/'],
    archive: 'corporate-wellness',
    name: 'Corporate Wellness',
    short: 'Fitness, yoga and massage for your team.',
    index: 'Group fitness, yoga and chair massage at your office.',
    img: 'svc-corporate',
    imgPos: '50% 50%',
    lede: 'A one-stop corporate wellness program for business owners and HR teams. We come to your office with fitness training, yoga and massage therapy, on your schedule.',
    blocks: [
      {
        h: 'Level One · Fitness',
        p: 'A SOHO Fit trainer runs group fitness classes at your office, in an open space, a company gym or even your parking lot, at no cost to employees. Most companies hold them at the end of the day.',
      },
      {
        h: 'Level Two · Fitness + Yoga',
        p: 'Everything in Level One, plus a SOHO Fit yoga instructor in any semi-private space with a soft floor, usually early afternoon or end of day.',
      },
      {
        h: 'Level Three · Fitness + Yoga + Massage',
        p: 'Add a massage therapist who sets up a chair on site. Staff flow through for 15 to 30 minute massages, from a two-hour visit to a full working day.',
      },
    ],
    facts: [
      ['Who it’s for', 'Business owners, HR and team leads'],
      ['Where', 'Your office or workspace'],
      ['Pricing', 'Varies by program and space. We’ll walk you through it'],
    ],
  },
  {
    slug: 'nutrition-coaching',
    old: ['/nutrition-coaching/', '/registered-dietitian-nutritionist/', '/portfolio-item/registered-dietitian-nutritionist/'],
    archive: 'nutrition-coaching',
    name: 'Nutrition Coaching',
    short: 'Habits that support the work.',
    index: 'One-on-one with a NASM Certified Nutrition Coach.',
    img: 'svc-nutrition',
    imgPos: '50% 50%',
    lede: 'Your workouts and your everyday eating work together. Work one-on-one with a NASM Certified Nutrition Coach on practical habits that fit your schedule, your family and your food.',
    blocks: [
      {
        h: 'What we work on',
        p: 'Balanced eating, portion awareness, fueling your workouts, meal preparation, dining out and travel, hydration, and accountability with goals you can actually hit.',
      },
      {
        h: 'How it works',
        p: 'Start with a consultation about your goals, habits and routine. Choose 30, 45 or 60 minute sessions. Each time, we pick a few manageable habits, then review what worked and adjust.',
      },
      {
        h: 'Training + nutrition',
        p: 'Any SOHO Fit trainer can talk general healthy eating in your sessions. A Certified Nutrition Coach goes deeper, with education and accountability. You don’t need to be a training client to book.',
      },
    ],
    facts: [
      ['Coach', 'NASM Certified Nutrition Coach'],
      ['Session length', '30, 45 or 60 minutes'],
      ['Note', 'Coaching, not meal plans or medical nutrition therapy'],
    ],
    disclaimer:
      'Nutrition coaching is provided by a NASM Certified Nutrition Coach and focuses on general wellness education and behavior change. It does not include prescribed meal plans, diagnosis, or medical nutrition treatment. Please consult a licensed dietitian for medical conditions requiring enhanced nutritional guidance.',
  },
  {
    slug: 'body-composition',
    old: ['/body-composition-analysis/'],
    archive: 'body-composition-analysis',
    name: 'Body Composition',
    short: 'Go beyond the scale.',
    index: 'InBody 270 scans, included with every training program.',
    img: 'svc-inbody',
    imgPos: '50% 40%',
    lede: 'Your weight is muscle, fat and water. The goal is losing fat, not just weight. Every SOHO Fit client gets regular body composition scans so you and your trainer can see what’s really changing.',
    blocks: [
      {
        h: 'The InBody 270',
        p: 'In under 15 seconds it measures skeletal muscle mass, percent body fat, body fat mass, basal metabolic rate and more, by segment: arms, legs and trunk.',
      },
      {
        h: 'Tracked in your app',
        p: 'Results go to an app on your phone. Scan every 2 to 4 weeks and watch fat loss and muscle gain in charts, not guesses.',
      },
    ],
    facts: [
      ['Device', 'InBody 270'],
      ['Scan time', 'Under 15 seconds'],
      ['Included', 'With all SOHO Fit training programs'],
    ],
  },
  {
    slug: 'assisted-stretch',
    old: ['/assisted-stretch-sessions-at-soho-fit/'],
    archive: 'assisted-stretch-sessions-at-soho-fit',
    name: 'Assisted Stretch',
    short: 'Mobility, recovery, range of motion.',
    index: 'One-on-one guided stretching, 30 to 60 minutes.',
    img: 'svc-stretch',
    imgPos: '50% 50%',
    lede: 'Guided, one-on-one stretching to improve flexibility and posture, release tension and recover from hard training or long days at a desk.',
    blocks: [
      {
        h: 'Tailored to you',
        p: 'Every session is built around your goals, current flexibility and comfort, from posture and daily mobility to recovery for serious athletes. Male and female stretch trainers are available.',
      },
      {
        h: 'What to expect',
        p: 'A short assessment of your focus areas, guided stretching with safe technique, then tips to keep your mobility between sessions. Sessions are held in a dedicated recovery space.',
      },
      {
        h: 'For current clients',
        p: 'Just tell your trainer or book in the MySohoFit app. Stretch sessions cost the same as a training session and come out of your existing pack. Not a client? Book stretch on its own.',
      },
    ],
    facts: [
      ['Session length', '30, 45 or 60 minutes'],
      ['Format', '1-on-1, private recovery space'],
      ['Trainers', 'Stretch-certified, male and female'],
    ],
  },
  {
    slug: 'kids-and-teens',
    old: ['/personal-training-for-kids-and-teens/'],
    archive: 'personal-training-for-kids-and-teens',
    name: 'Kids & Teens',
    short: 'Strength and confidence, early.',
    index: 'Age-appropriate and sport-specific training, typically 7+.',
    img: 'svc-youth',
    imgPos: '50% 30%',
    lede: 'Healthy habits built young last a lifetime. Our youth programs combine safe, fun training with expert coaching to build confidence, improve performance and keep kids active.',
    blocks: [
      {
        h: 'Coaches who played',
        p: 'SOHO Fit trainers have formal education and experience across many sports, most at college level and many in Division I. They coach sport-specific training to improve skills and help prevent injury.',
      },
      {
        h: 'What sessions focus on',
        p: 'Fundamental movement: balance, agility, flexibility and strength. Proper technique. Effort and progress over perfection. One-on-one, small groups or whatever format works best.',
      },
    ],
    facts: [
      ['Ages', 'Typically 7+, most clients are 12 to 17'],
      ['Format', '1-on-1 or small groups'],
      ['Good for', 'Young athletes, active kids, teens building strength'],
    ],
  },
  {
    slug: 'prenatal-postnatal',
    old: ['/prenatal-postnatal-pelvic-floor-training/'],
    archive: 'prenatal-postnatal-pelvic-floor-training',
    name: 'Prenatal & Postnatal',
    short: 'Safe. Supportive. On your terms.',
    index: 'Prenatal, postnatal and pelvic floor training.',
    img: 'svc-prenatal',
    imgPos: '50% 40%',
    lede: 'Specialized training for pregnancy, postpartum recovery and beyond, with an ISSA certified pre and postnatal fitness instructor who works slowly and methodically, always on your terms.',
    blocks: [
      {
        h: 'Prenatal',
        p: 'Trimester-specific strength and mobility, breathwork and core engagement, pelvic floor awareness, and safe modifications for fatigue or back pain. Built to support an active pregnancy and prepare for labor and recovery.',
      },
      {
        h: 'Postnatal',
        p: 'Diastasis recti-safe core training, posture and mobility work, and rebuilding strength and stamina, whether you are 6 weeks or 6 years postpartum. New moms need medical clearance and 6+ weeks postpartum.',
      },
      {
        h: 'Pelvic floor & core',
        p: 'For women seeking to improve function and reduce symptoms such as incontinence, prolapse support, core instability, or low back and hip pain. We collaborate with your pelvic health professionals when needed.',
      },
    ],
    facts: [
      ['Instructor', 'ISSA certified pre & postnatal'],
      ['Postnatal start', '6+ weeks postpartum, with medical clearance'],
      ['Format', '1-on-1'],
    ],
    trainerLink: 'bayli-king',
  },
];

// Trainer roster (12, from the live navigation). `line` is a factual summary from each bio.
export const trainers = [
  { slug: 'tyler-ding', first: 'Tyler', last: 'Ding', role: 'In-Studio', line: 'Voted best personal trainer in South Tampa. Exercise science degree, four years of baseball at UT.', tags: ['Weight loss', 'First responder testing', 'Pre & postnatal'] },
  { slug: 'kristin-blanchard', first: 'Kristin', last: 'Blanchard', role: 'In-Studio', line: 'Helps women build muscle and lose body fat with heavy, well-coached, progressive lifting.', tags: ['Strength for women', 'Body recomposition'] },
  { slug: 'jd', first: 'Jordan', last: 'Ding', role: 'At-Home & In-Studio', line: 'Nine-plus years coaching. Former FAU Division I baseball. Approved for at-home training.', tags: ['At-home', 'Muscle gain', 'Pickleball'] },
  { slug: 'lisa-scalzo', first: 'Lisa', last: 'Scalzo', role: 'In-Studio', line: 'Twenty-plus years. Certified Nutrition Coach and Functional Movement Specialist.', tags: ['Mobility', 'Women over 40', 'Nutrition'] },
  { slug: 'chavely-castro-amores', first: 'Chavely', last: 'Castro-Amores', role: 'In-Studio · English & Spanish', line: 'Eight years coaching women through strength, postpartum recovery and corrective exercise.', tags: ['Bilingual', 'Strength for women', 'Corrective'] },
  { slug: 'cole-ringquist', first: 'Cole', last: 'Ringquist', role: 'In-Studio', line: 'ACSM certified, NASM Corrective Exercise Specialist. Golfers, seniors and medical populations.', tags: ['Golf', 'Seniors', 'Corrective'] },
  { slug: 'andrew-dunbuss', first: 'Andrew', last: 'Dunbuss', role: 'In-Studio', line: 'Master’s in Nutrition Sciences. Conditioning for D1 programs at NC State and Cincinnati.', tags: ['Nutrition', 'Functional training'] },
  { slug: 'bayli-king', first: 'Bayli', last: 'King', role: 'In-Studio', line: 'Collegiate volleyball, Exercise Science degree. Athletes, injury recovery, pre and postnatal.', tags: ['Pre & postnatal', 'Speed & agility'] },
  { slug: 'jake-morran', first: 'Jake', last: 'Morran', role: 'In-Studio', line: 'Hands-on and detail-oriented. Functional fitness with a focus on muscle gain and weight loss.', tags: ['Functional fitness', 'Muscle gain'] },
  { slug: 'roman-blake', first: 'Roman', last: 'Blake', role: 'In-Studio', line: 'Functional strength and athletic performance, with training in rehab and injury prevention.', tags: ['Injury prevention', 'Basketball'] },
  { slug: 'joe-berg', first: 'Joe', last: 'Berg', role: 'In-Studio', line: 'Ten years personal training, fifteen teaching cycling. Strength and endurance circuits.', tags: ['Strength', 'Youth hockey'] },
  { slug: 'ashton-leal', first: 'Ashton', last: 'Leal', role: 'In-Studio', line: 'Nine-plus years. Teens, couples and older adults. Exercise and Nutrition Science.', tags: ['Teens', 'Couples', 'Older adults'] },
];

// Testimonials: verbatim from the archive. Excluded: reviews naming trainers no longer on the roster (T09, T10, T12, T13).
// `excerpt` uses only the reviewer's own words; omitted text is marked with an ellipsis.
export const testimonials = [
  { id: 'T07', author: 'Katie Keene', trainer: 'Jordan', text: 'Soho Fit is the best private personal training studio in Tampa, period. There are several trainers to choose from and each of them are excellent.' },
  { id: 'T08', author: 'Matthew Neuberger', trainer: 'Tyler', text: 'Best gym! In just four weeks of training with Tyler I am feeling and looking the best I ever have!' },
  { id: 'T02', author: 'Jack Gerber', trainer: 'Jordan', text: 'He’s been great at adapting to my needs and has great recommendations for my specific goals. He always follows up to see how I’m feeling and sends reminders the day before.' },
  { id: 'T15', author: 'Nehal Patel', trainer: 'Tyler', text: 'I’ve had many different personal trainers in the area and have either been inconsistent or had an old injury flare up - Tyler makes sure neither happens!' },
  { id: 'T14', author: 'Emma Fontaine', trainer: 'Tyler', text: 'I’m so glad I found SoHo Fit. This is a private, state of the art gym with excellent trainers.' },
  { id: 'T16', author: 'Sriram Sundaramoorthy', trainer: 'Jordan', text: '…what makes our experience great is Jordan’s ever-pleasant personality and his ability to tailor every minute of our training to not only our needs but how we are doing that specific moment.' },
];

export const nav = [
  { href: 'training/', label: 'Training' },
  { href: 'trainers/', label: 'Trainers' },
  { href: 'studios/', label: 'Studios' },
];
