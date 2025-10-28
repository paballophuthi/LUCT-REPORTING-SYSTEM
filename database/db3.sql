
-- Insert Faculties
INSERT INTO faculties (name, code, description) VALUES 
('Faculty of Information Communication Technology', 'FICT', 'Focuses on IT, computer science, software development, and information systems'),
('Faculty of Business Management and Governance', 'FBMG', 'Focuses on business administration, management, governance, and entrepreneurship'),
('Faculty of Architecture and Built Environment', 'FABE', 'Focuses on architecture, design, construction, and built environment studies');

-- Insert Programs for each faculty
INSERT INTO programs (name, code, faculty_id, duration_years) VALUES 
-- FICT Programs
('Diploma in Information Technology', 'DIT', (SELECT id FROM faculties WHERE code = 'FICT'), 3),
('BSc in Information Technology', 'BSCIT', (SELECT id FROM faculties WHERE code = 'FICT'), 4),
('Diploma in Business Information Technology', 'DBIT', (SELECT id FROM faculties WHERE code = 'FICT'), 3),
('BSc in Software Engineering', 'BSSE', (SELECT id FROM faculties WHERE code = 'FICT'), 4),

-- FBMG Programs
('Diploma in Business Management', 'DBM', (SELECT id FROM faculties WHERE code = 'FBMG'), 3),
('Bachelor of Business Administration', 'BBA', (SELECT id FROM faculties WHERE code = 'FBMG'), 4),
('Diploma in Office Management', 'DOM', (SELECT id FROM faculties WHERE code = 'FBMG'), 2),
('BSc in Accounting', 'BSA', (SELECT id FROM faculties WHERE code = 'FBMG'), 4),

-- FABE Programs
('Diploma in Architectural Technology', 'DAT', (SELECT id FROM faculties WHERE code = 'FABE'), 3),
('Bachelor of Architecture', 'BARCH', (SELECT id FROM faculties WHERE code = 'FABE'), 5),
('Diploma in Interior Design', 'DID', (SELECT id FROM faculties WHERE code = 'FABE'), 3),
('Diploma in Construction Management', 'DCM', (SELECT id FROM faculties WHERE code = 'FABE'), 3);

-- Insert Courses (3 main courses per faculty as requested)
INSERT INTO courses (name, code, faculty, program_id, credits, description) VALUES 
-- FICT Courses (3 main courses)
('Web Application Development', 'DIWA2110', 'FICT', (SELECT id FROM programs WHERE code = 'DIT'), 3, 
 'Comprehensive course on developing modern web applications using HTML, CSS, JavaScript, React, and Node.js'),

('Database Management Systems', 'DIDB2105', 'FICT', (SELECT id FROM programs WHERE code = 'DIT'), 3, 
 'Fundamentals of database design, SQL, normalization, and database administration with PostgreSQL and MySQL'),

('Network Fundamentals', 'DINF2108', 'FICT', (SELECT id FROM programs WHERE code = 'DIT'), 3, 
 'Introduction to computer networking, TCP/IP protocols, network security, and network infrastructure'),

-- Additional FICT courses for variety
('Object-Oriented Programming', 'DIOP2103', 'FICT', (SELECT id FROM programs WHERE code = 'BSCIT'), 3,
 'Programming concepts using Java and Python with focus on OOP principles and design patterns'),

('Mobile Application Development', 'DIMA2112', 'FICT', (SELECT id FROM programs WHERE code = 'BSCIT'), 3,
 'Development of mobile applications for Android and iOS platforms using modern frameworks'),

-- FBMG Courses (3 main courses)
('Principles of Management', 'BMGT101', 'FBMG', (SELECT id FROM programs WHERE code = 'BBA'), 3,
 'Fundamental concepts of management, organizational behavior, and leadership principles'),

('Financial Accounting', 'BFIN102', 'FBMG', (SELECT id FROM programs WHERE code = 'BBA'), 3,
 'Introduction to financial accounting principles, bookkeeping, and financial statement analysis'),

('Marketing Management', 'BMKT103', 'FBMG', (SELECT id FROM programs WHERE code = 'BBA'), 3,
 'Marketing principles, consumer behavior, market research, and marketing strategy development'),

-- Additional FBMG courses for variety
('Business Ethics', 'BETH104', 'FBMG', (SELECT id FROM programs WHERE code = 'DBM'), 3,
 'Ethical considerations in business decision making and corporate social responsibility'),

('Entrepreneurship', 'BENT105', 'FBMG', (SELECT id FROM programs WHERE code = 'DBM'), 3,
 'Entrepreneurial mindset, business planning, and startup development strategies'),

-- FABE Courses (3 main courses)
('Architectural Design Studio I', 'ARCH101', 'FABE', (SELECT id FROM programs WHERE code = 'BARCH'), 3,
 'Fundamental principles of architectural design, spatial planning, and creative design process'),

('Building Construction Technology', 'BCT102', 'FABE', (SELECT id FROM programs WHERE code = 'BARCH'), 3,
 'Construction methods, materials, building systems, and sustainable construction practices'),

('Architectural History', 'AHIS103', 'FABE', (SELECT id FROM programs WHERE code = 'BARCH'), 3,
 'Historical development of architecture from ancient to contemporary periods'),

-- Additional FABE courses for variety
('Structural Systems', 'SSYS104', 'FABE', (SELECT id FROM programs WHERE code = 'DAT'), 3,
 'Analysis and design of structural systems in buildings and infrastructure'),

('Environmental Design', 'ENVD105', 'FABE', (SELECT id FROM programs WHERE code = 'DAT'), 3,
 'Sustainable design principles, environmental systems, and green building strategies');

-- Insert Classes for each program
INSERT INTO classes (name, code, faculty, program_id, total_students, academic_year, semester) VALUES 
-- FICT Classes
('DIT Year 1 Group A', 'DIT1A', 'FICT', (SELECT id FROM programs WHERE code = 'DIT'), 45, '2024', '1'),
('DIT Year 1 Group B', 'DIT1B', 'FICT', (SELECT id FROM programs WHERE code = 'DIT'), 42, '2024', '1'),
('DIT Year 2 Group A', 'DIT2A', 'FICT', (SELECT id FROM programs WHERE code = 'DIT'), 38, '2024', '1'),
('BSCIT Year 1 Group A', 'BSCIT1A', 'FICT', (SELECT id FROM programs WHERE code = 'BSCIT'), 50, '2024', '1'),
('BSCIT Year 2 Group A', 'BSCIT2A', 'FICT', (SELECT id FROM programs WHERE code = 'BSCIT'), 48, '2024', '1'),
('DBIT Year 1 Group A', 'DBIT1A', 'FICT', (SELECT id FROM programs WHERE code = 'DBIT'), 35, '2024', '1'),

-- FBMG Classes
('BBA Year 1 Group A', 'BBA1A', 'FBMG', (SELECT id FROM programs WHERE code = 'BBA'), 55, '2024', '1'),
('BBA Year 1 Group B', 'BBA1B', 'FBMG', (SELECT id FROM programs WHERE code = 'BBA'), 52, '2024', '1'),
('BBA Year 2 Group A', 'BBA2A', 'FBMG', (SELECT id FROM programs WHERE code = 'BBA'), 58, '2024', '1'),
('DBM Year 1 Group A', 'DBM1A', 'FBMG', (SELECT id FROM programs WHERE code = 'DBM'), 40, '2024', '1'),
('DBM Year 2 Group A', 'DBM2A', 'FBMG', (SELECT id FROM programs WHERE code = 'DBM'), 36, '2024', '1'),

-- FABE Classes
('BARCH Year 1 Studio A', 'BARCH1A', 'FABE', (SELECT id FROM programs WHERE code = 'BARCH'), 30, '2024', '1'),
('BARCH Year 1 Studio B', 'BARCH1B', 'FABE', (SELECT id FROM programs WHERE code = 'BARCH'), 28, '2024', '1'),
('BARCH Year 2 Studio A', 'BARCH2A', 'FABE', (SELECT id FROM programs WHERE code = 'BARCH'), 32, '2024', '1'),
('DAT Year 1 Group A', 'DAT1A', 'FABE', (SELECT id FROM programs WHERE code = 'DAT'), 25, '2024', '1'),
('DAT Year 2 Group A', 'DAT2A', 'FABE', (SELECT id FROM programs WHERE code = 'DAT'), 22, '2024', '1'),
('DID Year 1 Group A', 'DID1A', 'FABE', (SELECT id FROM programs WHERE code = 'DID'), 20, '2024', '1');

