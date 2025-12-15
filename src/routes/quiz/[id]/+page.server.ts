import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { PageServerLoad, Actions } from './$types';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const quizId = event.params.id;

	// Verify user has access to this quiz
	const userQuizAccess = await db
		.select()
		.from(table.userQuiz)
		.where(and(eq(table.userQuiz.userId, event.locals.user.id), eq(table.userQuiz.quizId, quizId)));

	if (userQuizAccess.length === 0) {
		return redirect(302, '/');
	}

	// Fetch quiz
	const quizzes = await db.select().from(table.quiz).where(eq(table.quiz.id, quizId));
	if (quizzes.length === 0) {
		return redirect(302, '/');
	}

	const quiz = quizzes[0];

	// Fetch questions
	const questions = await db
		.select()
		.from(table.question)
		.where(eq(table.question.quizId, quizId))
		.orderBy(table.question.order);

	// Fetch answers for each question and shuffle them
	const questionsWithAnswers = await Promise.all(
		questions.map(async (question) => {
			const answers = await db
				.select()
				.from(table.answer)
				.where(eq(table.answer.questionId, question.id))
				.orderBy(table.answer.order);

			return {
				...question,
				answers: shuffleArray(answers)
			};
		})
	);

	return {
		quiz,
		questions: questionsWithAnswers
	};
};

export const actions: Actions = {
	submit: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}

		const formData = await event.request.formData();
		const quizId = formData.get('quizId') as string;
		const answersRaw = formData.getAll('answers') as string[];

		// Verify user has access to this quiz
		const userQuizAccess = await db
			.select()
			.from(table.userQuiz)
			.where(and(eq(table.userQuiz.userId, event.locals.user.id), eq(table.userQuiz.quizId, quizId)));

		if (userQuizAccess.length === 0) {
			return redirect(302, '/');
		}

		// Parse answers
		const userAnswers: Record<string, string> = {};
		answersRaw.forEach((answer) => {
			const [questionId, answerId] = answer.split(':');
			userAnswers[questionId] = answerId;
		});

		// Get all questions and answers to calculate score
		const questions = await db.select().from(table.question).where(eq(table.question.quizId, quizId));

		let score = 0;
		const resultId = encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));

		// Create quiz result record
		await db.insert(table.quizResult).values({
			id: resultId,
			userId: event.locals.user.id,
			quizId,
			score: 0, // Will update after checking answers
			totalQuestions: questions.length,
			completedAt: new Date()
		});

		// Store user answers and calculate score
		for (const question of questions) {
			const userAnswerId = userAnswers[question.id];

			if (userAnswerId) {
				const answers = await db
					.select()
					.from(table.answer)
					.where(eq(table.answer.questionId, question.id));

				const selectedAnswer = answers.find((a) => a.id === userAnswerId);

				// Record user answer
				const userAnswerRecord = {
					id: encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15))),
					resultId,
					questionId: question.id,
					answerId: userAnswerId,
					userText: null
				};

				await db.insert(table.userAnswer).values(userAnswerRecord);

				// Check if correct
				if (selectedAnswer?.isCorrect) {
					score++;
				}
			}
		}

		// Update result with final score
		await db.update(table.quizResult).set({ score }).where(eq(table.quizResult.id, resultId));

		return redirect(302, `/results/${resultId}`);
	}
};
