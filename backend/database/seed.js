const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'autoexam_pro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');

    // Hash passwords
    const professorPassword = await bcrypt.hash('professor123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insert demo users
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, role) 
      VALUES 
        ('professor@example.com', $1, 'professor'),
        ('admin@example.com', $2, 'admin')
      RETURNING id, email, role;
    `, [professorPassword, adminPassword]);

    console.log('✅ Created demo users:');
    userResult.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    const professorId = userResult.rows[0].id;

    // Insert demo course
    const courseResult = await client.query(`
      INSERT INTO courses (professor_id, code, name)
      VALUES ($1, 'CS101', 'Data Structures and Algorithms')
      RETURNING id, code, name;
    `, [professorId]);

    const courseId = courseResult.rows[0].id;
    console.log('\n✅ Created demo course:');
    console.log(`   - ${courseResult.rows[0].code}: ${courseResult.rows[0].name}`);

    // Insert units
    const unitTexts = [
      'Introduction to Data Structures, Arrays, Linked Lists',
      'Stacks, Queues, and their applications',
      'Trees, Binary Trees, BST, AVL Trees',
      'Graphs, Graph Traversal, Shortest Path Algorithms'
    ];

    const unitIds = [];
    for (let i = 0; i < 4; i++) {
      const result = await client.query(`
        INSERT INTO units (course_id, unit_number, content)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [courseId, i + 1, unitTexts[i]]);
      unitIds.push(result.rows[0].id);
    }

    console.log('\n✅ Created 4 course units');

    // Insert COs
    const coDescriptions = [
      'Understand basic data structures and their operations',
      'Apply appropriate data structures for problem solving',
      'Analyze time and space complexity of algorithms',
      'Implement common algorithms using various data structures',
      'Design efficient solutions for complex problems',
      'Evaluate and compare different algorithmic approaches'
    ];

    const coIds = [];
    for (let i = 0; i < 6; i++) {
      const result = await client.query(`
        INSERT INTO cos (course_id, co_number, description)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [courseId, i + 1, coDescriptions[i]]);
      coIds.push(result.rows[0].id);
    }

    console.log('✅ Created 6 course outcomes');

    // Insert sample questions
    const questions = [
      {
        text: 'Define a linked list and explain its advantages over arrays.',
        type: 'short_answer',
        marks: 2,
        difficulty: 'easy',
        unitIndex: 0,
        coIndexes: [0, 1]
      },
      {
        text: 'Explain the concept of a stack with LIFO property.',
        type: 'short_answer',
        marks: 2,
        difficulty: 'easy',
        unitIndex: 1,
        coIndexes: [0]
      },
      {
        text: 'Write an algorithm to implement a queue using two stacks.',
        type: 'long_answer',
        marks: 8,
        difficulty: 'medium',
        unitIndex: 1,
        coIndexes: [1, 3]
      },
      {
        text: 'Describe the process of traversing a binary tree using inorder traversal.',
        type: 'short_answer',
        marks: 5,
        difficulty: 'medium',
        unitIndex: 2,
        coIndexes: [0, 1]
      },
      {
        text: 'Implement Dijkstra\'s algorithm for finding the shortest path in a weighted graph.',
        type: 'long_answer',
        marks: 8,
        difficulty: 'hard',
        unitIndex: 3,
        coIndexes: [2, 3, 4]
      }
    ];

    for (const q of questions) {
      const result = await client.query(`
        INSERT INTO questions (course_id, text, type, marks, difficulty, unit_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `, [courseId, q.text, q.type, q.marks, q.difficulty, unitIds[q.unitIndex]]);

      const questionId = result.rows[0].id;

      // Map question to COs
      for (const coIndex of q.coIndexes) {
        await client.query(`
          INSERT INTO question_co_mapping (question_id, co_id)
          VALUES ($1, $2);
        `, [questionId, coIds[coIndex]]);
      }
    }

    console.log('✅ Created sample questions');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📝 Demo credentials:');
    console.log('   Professor: professor@example.com / professor123');
    console.log('   Admin: admin@example.com / admin123\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
