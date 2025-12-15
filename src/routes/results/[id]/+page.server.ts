import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const resultId = event.params.id;

	// Fetch quiz result
	const results = await db
		.select({
			result: table.quizResult,
			quiz: table.quiz
		})
		.from(table.quizResult)
		.innerJoin(table.quiz, eq(table.quizResult.quizId, table.quiz.id))
		.where(eq(table.quizResult.id, resultId));

	if (results.length === 0) {
		return redirect(302, '/');
	}

	if (results[0].result.userId !== event.locals.user.id) {
		return redirect(302, '/');
	}

	const { result, quiz } = results[0];

	// Fetch user answers with details
	const userAnswers = await db
		.select({
			id: table.userAnswer.id,
			questionText: table.question.text,
			userAnswerText: table.answer.text,
			isCorrect: table.answer.isCorrect
		})
		.from(table.userAnswer)
		.innerJoin(table.question, eq(table.userAnswer.questionId, table.question.id))
		.innerJoin(table.answer, eq(table.userAnswer.answerId, table.answer.id))
		.where(eq(table.userAnswer.resultId, resultId));

	// Get correct answers for incorrect responses
	const enrichedAnswers = await Promise.all(
		userAnswers.map(async (ua) => {
			if (!ua.isCorrect) {
				const correctAnswer = await db
					.select()
					.from(table.answer)
					.innerJoin(table.question, eq(table.answer.questionId, table.question.id))
					.where(eq(table.answer.isCorrect, true));

				const correct = correctAnswer.find(
					(ca) => ca.question.text === ua.questionText
				);

				return {
					...ua,
					correct: ua.isCorrect,
					correctAnswerText: correct?.answer.text || null
				};
			}

			return {
				...ua,
				correct: ua.isCorrect,
				correctAnswerText: null
			};
		})
	);

	return {
		result,
		quiz,
		userAnswers: enrichedAnswers
	};
};
