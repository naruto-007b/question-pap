# Database Schema Documentation

## Overview

AutoExam Pro uses PostgreSQL as its database. The schema is designed to support question bank management, course organization, and automated exam paper generation.

## Entity Relationship Diagram (Textual)

```
users (1) ─────< (M) courses
                      │
                      ├─────< (M) units
                      ├─────< (M) cos (Course Outcomes)
                      ├─────< (M) questions
                      └─────< (M) generated_papers
                                    │
                                    └─────< (M) paper_questions

questions (M) ────< question_co_mapping >──── (M) cos

generated_papers (M) ──────> (1) blueprints
```

## Tables

### 1. users
Stores professor and admin user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(20) | CHECK ('professor', 'admin'), DEFAULT 'professor' | User role |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:** email, role

---

### 2. courses
Stores course information managed by professors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique course identifier |
| professor_id | UUID | FOREIGN KEY (users.id), NOT NULL | Course owner |
| code | VARCHAR(50) | NOT NULL | Course code (e.g., "CS101") |
| name | VARCHAR(255) | NOT NULL | Course name |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Course creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:** professor_id, code

---

### 3. units
Stores course units (1-4 per course).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique unit identifier |
| course_id | UUID | FOREIGN KEY (courses.id), NOT NULL | Parent course |
| unit_number | INT | CHECK (1-4), NOT NULL | Unit number (1, 2, 3, or 4) |
| content | TEXT | NULL | Unit content/syllabus |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Unit creation time |

**Unique Constraint:** (course_id, unit_number)  
**Indexes:** course_id

---

### 4. cos (Course Outcomes)
Stores course outcomes (1-6 per course).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique CO identifier |
| course_id | UUID | FOREIGN KEY (courses.id), NOT NULL | Parent course |
| co_number | INT | CHECK (1-6), NOT NULL | CO number (1-6) |
| description | TEXT | NOT NULL | CO description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | CO creation time |

**Unique Constraint:** (course_id, co_number)  
**Indexes:** course_id

---

### 5. questions
Stores all questions in the question bank.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique question identifier |
| course_id | UUID | FOREIGN KEY (courses.id), NOT NULL | Parent course |
| text | TEXT | NOT NULL | Question text |
| type | VARCHAR(20) | CHECK ('short_answer', 'long_answer'), NOT NULL | Question type |
| marks | INT | CHECK (2, 5, 6, 8), NOT NULL | Marks allocated |
| difficulty | VARCHAR(20) | CHECK ('easy', 'medium', 'hard'), NOT NULL | Difficulty level |
| unit_id | UUID | FOREIGN KEY (units.id), NOT NULL | Associated unit |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Question creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:** course_id, unit_id, type, marks, difficulty

**Business Rules:**
- Short answer questions: typically 2 or 5 marks
- Long answer questions: typically 6 or 8 marks

---

### 6. question_co_mapping
Maps questions to course outcomes (many-to-many relationship).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique mapping identifier |
| question_id | UUID | FOREIGN KEY (questions.id), NOT NULL | Question reference |
| co_id | UUID | FOREIGN KEY (cos.id), NOT NULL | CO reference |

**Unique Constraint:** (question_id, co_id)  
**Indexes:** question_id, co_id

---

### 7. blueprints
Stores exam paper blueprint templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique blueprint identifier |
| name | VARCHAR(255) | NOT NULL | Blueprint name |
| structure | JSONB | NOT NULL | Blueprint structure (Part A, Part B config) |
| is_default | BOOLEAN | DEFAULT FALSE | Whether this is the default blueprint |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Blueprint creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:** is_default

**Example Structure:**
```json
{
  "part_a": {
    "question_count": 10,
    "marks_per_question": 2,
    "total_marks": 20,
    "type": "short_answer",
    "description": "Answer ALL questions"
  },
  "part_b": {
    "question_count": 5,
    "questions_to_answer": 3,
    "marks_per_question": 10,
    "total_marks": 30,
    "type": "long_answer",
    "description": "Answer any THREE questions"
  }
}
```

---

### 8. generated_papers
Stores metadata for generated exam papers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique paper identifier |
| course_id | UUID | FOREIGN KEY (courses.id), NOT NULL | Course for this paper |
| blueprint_id | UUID | FOREIGN KEY (blueprints.id), NOT NULL | Blueprint used |
| exam_type | VARCHAR(20) | CHECK ('mid_term', 'final'), NOT NULL | Type of exam |
| pdf_url | VARCHAR(500) | NULL | URL to generated PDF (Phase 2) |
| generated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Generation timestamp |

**Indexes:** course_id, blueprint_id, exam_type

---

### 9. paper_questions
Tracks which questions were used in each generated paper.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique mapping identifier |
| paper_id | UUID | FOREIGN KEY (generated_papers.id), NOT NULL | Paper reference |
| question_id | UUID | FOREIGN KEY (questions.id), NOT NULL | Question reference |
| position | INT | NOT NULL | Position/order in the paper |

**Indexes:** paper_id, question_id

---

## Triggers

### update_updated_at_column()
Automatically updates the `updated_at` timestamp on the following tables:
- users
- courses
- questions
- blueprints

---

## Default Data

The initial migration creates one default blueprint:

**Name:** Default Institutional Blueprint  
**Structure:** Standard 2-part exam format (Part A: 10x2 marks, Part B: 3/5x10 marks)

---

## Migrations

Run migrations with:
```bash
npm run migrate
```

Seed demo data with:
```bash
npm run seed
```

---

## Queries & Best Practices

### Getting all questions for a course with COs
```sql
SELECT 
  q.id, q.text, q.type, q.marks, q.difficulty,
  u.unit_number,
  array_agg(c.co_number) as co_numbers
FROM questions q
JOIN units u ON q.unit_id = u.id
LEFT JOIN question_co_mapping qcm ON q.id = qcm.question_id
LEFT JOIN cos c ON qcm.co_id = c.id
WHERE q.course_id = $1
GROUP BY q.id, u.unit_number
ORDER BY u.unit_number, q.difficulty;
```

### Finding unused questions (not in any paper)
```sql
SELECT q.* 
FROM questions q
WHERE q.id NOT IN (
  SELECT DISTINCT question_id 
  FROM paper_questions
)
AND q.course_id = $1;
```

### CO coverage report for a generated paper
```sql
SELECT 
  c.co_number,
  COUNT(DISTINCT pq.question_id) as question_count
FROM generated_papers gp
JOIN paper_questions pq ON gp.id = pq.paper_id
JOIN question_co_mapping qcm ON pq.question_id = qcm.question_id
JOIN cos c ON qcm.co_id = c.id
WHERE gp.id = $1
GROUP BY c.co_number
ORDER BY c.co_number;
```

---

## Backup & Restore

### Backup
```bash
pg_dump -U postgres autoexam_pro > backup.sql
```

### Restore
```bash
psql -U postgres -d autoexam_pro < backup.sql
```

---

Last Updated: Phase 1 - Initial Setup
