import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	// Verify user is admin
	if (!event.locals.user.isAdmin) {
		return redirect(302, '/');
	}

	const resultId = event.params.id;

	// Fetch quiz result with user and quiz information
	const results = await db
		.select({
			id: table.quizResult.id,
			userId: table.quizResult.userId,
			quizId: table.quizResult.quizId,
			score: table.quizResult.score,
			totalQuestions: table.quizResult.totalQuestions,
			completedAt: table.quizResult.completedAt,
			userName: table.user.username,
			quizTitle: table.quiz.title
		})
		.from(table.quizResult)
		.innerJoin(table.user, eq(table.quizResult.userId, table.user.id))
		.innerJoin(table.quiz, eq(table.quizResult.quizId, table.quiz.id))
		.where(eq(table.quizResult.id, resultId));

	if (results.length === 0) {
		return redirect(302, '/admin/results');
	}

	const result = results[0];

	// Fetch all user answers with question and answer details
	const userAnswers = await db
		.select({
			questionId: table.userAnswer.questionId,
			answerId: table.userAnswer.answerId,
			questionText: table.question.text,
			selectedAnswerText: table.answer.text,
			selectedAnswerIsCorrect: table.answer.isCorrect,
			correctAnswerText: table.answer.text,
			correctAnswerIsCorrect: table.answer.isCorrect
		})
		.from(table.userAnswer)
		.innerJoin(table.question, table.userAnswer.questionId === table.question.id)
		.innerJoin(table.answer, table.userAnswer.answerId === table.answer.id)
		.where(eq(table.userAnswer.resultId, resultId));

	// Fetch all questions to display correct answers
	const allQuestions = await db
		.select()
		.from(table.question)
		.where(eq(table.question.quizId, result.quizId))
		.orderBy(table.question.order);

	const questionsWithAnswers = await Promise.all(
		allQuestions.map(async (question) => {
			const answers = await db
				.select()
				.from(table.answer)
				.where(eq(table.answer.questionId, question.id))
				.orderBy(table.answer.order);

			const userAnswer = userAnswers.find((ua) => ua.questionId === question.id);

			return {
				...question,
				answers,
				userAnswerId: userAnswer?.answerId,
				isCorrect: userAnswer?.selectedAnswerIsCorrect
			};
		})
	);

	return {
		result,
		questions: questionsWithAnswers
	};
};
