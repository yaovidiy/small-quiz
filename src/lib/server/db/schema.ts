import { pgTable, text, integer, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	isAdmin: boolean('is_admin').notNull().default(false)
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const quiz = pgTable('quiz', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const userQuiz = pgTable(
	'user_quiz',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		quizId: text('quiz_id')
			.notNull()
			.references(() => quiz.id),
		assignedAt: timestamp('assigned_at', { withTimezone: true, mode: 'date' }).notNull()
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.quizId] })
	})
);

export const question = pgTable('question', {
	id: text('id').primaryKey(),
	quizId: text('quiz_id')
		.notNull()
		.references(() => quiz.id),
	text: text('text').notNull(),
	type: text('type').notNull().default('multiple-choice'), // multiple-choice, true-false, short-answer
	order: integer('order').notNull()
});

export const answer = pgTable('answer', {
	id: text('id').primaryKey(),
	questionId: text('question_id')
		.notNull()
		.references(() => question.id),
	text: text('text').notNull(),
	isCorrect: boolean('is_correct').notNull(),
	order: integer('order').notNull()
});

export const quizResult = pgTable('quiz_result', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	quizId: text('quiz_id')
		.notNull()
		.references(() => quiz.id),
	score: integer('score').notNull(),
	totalQuestions: integer('total_questions').notNull(),
	completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const userAnswer = pgTable('user_answer', {
	id: text('id').primaryKey(),
	resultId: text('result_id')
		.notNull()
		.references(() => quizResult.id),
	questionId: text('question_id')
		.notNull()
		.references(() => question.id),
	answerId: text('answer_id').references(() => answer.id),
	userText: text('user_text')
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Quiz = typeof quiz.$inferSelect;
export type UserQuiz = typeof userQuiz.$inferSelect;
export type Question = typeof question.$inferSelect;
export type Answer = typeof answer.$inferSelect;
export type QuizResult = typeof quizResult.$inferSelect;
export type UserAnswer = typeof userAnswer.$inferSelect;
