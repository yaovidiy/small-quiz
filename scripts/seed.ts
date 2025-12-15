import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as table from '../src/lib/server/db/schema.js';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Connect directly to database for seeding
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error('❌ DATABASE_URL environment variable is not set');
	process.exit(1);
}

const client = postgres(databaseUrl);
const db = drizzle(client);

// Generate IDs
const generateId = () => encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));

// Junior Frontend Developer Quiz
const juniorQuizId = generateId();
const juniorQuestions = [
	{
		id: generateId(),
		text: 'What does HTML stand for?',
		type: 'multiple-choice',
		order: 0,
		answers: [
			{ text: 'HyperText Markup Language', isCorrect: true, order: 0 },
			{ text: 'High Tech Modern Language', isCorrect: false, order: 1 },
			{ text: 'Home Tool Markup Language', isCorrect: false, order: 2 },
			{ text: 'Hyperlinks and Text Markup Language', isCorrect: false, order: 3 }
		]
	},
	{
		id: generateId(),
		text: 'Which CSS property is used to change text color?',
		type: 'multiple-choice',
		order: 1,
		answers: [
			{ text: 'color', isCorrect: true, order: 0 },
			{ text: 'text-color', isCorrect: false, order: 1 },
			{ text: 'font-color', isCorrect: false, order: 2 },
			{ text: 'text-style', isCorrect: false, order: 3 }
		]
	},
	{
		id: generateId(),
		text: 'What is the correct syntax for a JavaScript function?',
		type: 'multiple-choice',
		order: 2,
		answers: [
			{ text: 'function myFunc() {}', isCorrect: true, order: 0 },
			{ text: 'func myFunc() {}', isCorrect: false, order: 1 },
			{ text: 'def myFunc() {}', isCorrect: false, order: 2 },
			{ text: 'function: myFunc() {}', isCorrect: false, order: 3 }
		]
	},
	{
		id: generateId(),
		text: 'Is JavaScript case-sensitive?',
		type: 'true-false',
		order: 3,
		answers: [
			{ text: 'true', isCorrect: true, order: 0 },
			{ text: 'false', isCorrect: false, order: 1 }
		]
	},
	{
		id: generateId(),
		text: 'What does the DOM stand for?',
		type: 'multiple-choice',
		order: 4,
		answers: [
			{ text: 'Document Object Model', isCorrect: true, order: 0 },
			{ text: 'Data Object Module', isCorrect: false, order: 1 },
			{ text: 'Document Oriented Model', isCorrect: false, order: 2 },
			{ text: 'Digital Object Management', isCorrect: false, order: 3 }
		]
	}
];

// Middle Frontend Developer Quiz
const middleQuizId = generateId();
const middleQuestions = [
	{
		id: generateId(),
		text: 'What is the difference between let and const in JavaScript?',
		type: 'multiple-choice',
		order: 0,
		answers: [
			{ text: 'const cannot be reassigned, let can be reassigned', isCorrect: true, order: 0 },
			{ text: 'let cannot be reassigned, const can be reassigned', isCorrect: false, order: 1 },
			{ text: 'They are exactly the same', isCorrect: false, order: 2 },
			{ text: 'const is only for objects', isCorrect: false, order: 3 }
		]
	},
	{
		id: generateId(),
		text: 'What is event delegation in JavaScript?',
		type: 'multiple-choice',
		order: 1,
		answers: [
			{ text: 'Handling events on parent elements instead of children', isCorrect: true, order: 0 },
			{ text: 'Creating multiple event listeners', isCorrect: false, order: 1 },
			{ text: 'Removing event listeners', isCorrect: false, order: 2 },
			{ text: 'Cloning DOM elements', isCorrect: false, order: 3 }
		]
	},
	{
		id: generateId(),
		text: 'What is a closure in JavaScript?',
		type: 'multiple-choice',
		order: 2,
		answers: [
			{ text: 'A function that has access to variables from its outer scope', isCorrect: true, order: 0 },
			{ text: 'A way to close a function', isCorrect: false, order: 1 },
			{ text: 'An error handling mechanism', isCorrect: false, order: 2 },
			{ text: 'A loop statement', isCorrect: false, order: 3 }
		]
	},
	{
		id: generateId(),
		text: 'Flexbox is the best way to layout modern websites.',
		type: 'true-false',
		order: 3,
		answers: [
			{ text: 'true', isCorrect: true, order: 0 },
			{ text: 'false', isCorrect: false, order: 1 }
		]
	},
	{
		id: generateId(),
		text: 'What is the purpose of async/await in JavaScript?',
		type: 'multiple-choice',
		order: 4,
		answers: [
			{ text: 'To handle asynchronous operations in a synchronous-looking way', isCorrect: true, order: 0 },
			{ text: 'To make code execute synchronously', isCorrect: false, order: 1 },
			{ text: 'To replace promises completely', isCorrect: false, order: 2 },
			{ text: 'To speed up code execution', isCorrect: false, order: 3 }
		]
	},
	{
		id: generateId(),
		text: 'What is the difference between var, let, and const?',
		type: 'multiple-choice',
		order: 5,
		answers: [
			{ text: 'var is function-scoped, let and const are block-scoped', isCorrect: true, order: 0 },
			{ text: 'They are all the same', isCorrect: false, order: 1 },
			{ text: 'var and let are the same, const is different', isCorrect: false, order: 2 },
			{ text: 'All are block-scoped', isCorrect: false, order: 3 }
		]
	}
];

async function seed() {
	console.log('🌱 Starting database seed...');

	try {
		// Insert Junior Quiz
		console.log('📝 Creating Junior Frontend Developer quiz...');
		await db.insert(table.quiz).values({
			id: juniorQuizId,
			title: 'Junior Frontend Developer',
			description: 'Test your knowledge of HTML, CSS, and JavaScript fundamentals',
			createdAt: new Date()
		});

		// Insert Junior Questions and Answers
		for (const question of juniorQuestions) {
			const { answers, ...questionData } = question;
			await db.insert(table.question).values({
				...questionData,
				quizId: juniorQuizId
			});

			for (const answer of answers) {
				await db.insert(table.answer).values({
					id: generateId(),
					questionId: question.id,
					...answer
				});
			}
		}

		// Insert Middle Quiz
		console.log('📝 Creating Middle Frontend Developer quiz...');
		await db.insert(table.quiz).values({
			id: middleQuizId,
			title: 'Middle Frontend Developer',
			description: 'Test your advanced JavaScript, CSS, and web development knowledge',
			createdAt: new Date()
		});

		// Insert Middle Questions and Answers
		for (const question of middleQuestions) {
			const { answers, ...questionData } = question;
			await db.insert(table.question).values({
				...questionData,
				quizId: middleQuizId
			});

			for (const answer of answers) {
				await db.insert(table.answer).values({
					id: generateId(),
					questionId: question.id,
					...answer
				});
			}
		}

		console.log('✅ Database seed completed successfully!');
		console.log(`   - Junior Frontend Developer Quiz (${juniorQuestions.length} questions)`);
		console.log(`   - Middle Frontend Developer Quiz (${middleQuestions.length} questions)`);
		process.exit(0);
	} catch (error) {
		console.error('❌ Seed failed:', error);
		process.exit(1);
	}
}

seed();
