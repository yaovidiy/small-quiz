import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	// Fetch quizzes assigned to the user
	const userQuizzes = await db
		.select({
			quiz: table.quiz,
			assignedAt: table.userQuiz.assignedAt
		})
		.from(table.userQuiz)
		.innerJoin(table.quiz, eq(table.userQuiz.quizId, table.quiz.id))
		.where(eq(table.userQuiz.userId, event.locals.user.id));

	// Get question counts for each quiz
	const quizzesWithCounts = await Promise.all(
		userQuizzes.map(async (item) => {
			const questions = await db
				.select({ count: table.question.id })
				.from(table.question)
				.where(eq(table.question.quizId, item.quiz.id));
			return {
				...item.quiz,
				questionCount: questions.length,
				assignedAt: item.assignedAt
			};
		})
	);

	// Fetch user's recent results
	const results = await db
		.select({
			id: table.quizResult.id,
			score: table.quizResult.score,
			totalQuestions: table.quizResult.totalQuestions,
			completedAt: table.quizResult.completedAt,
			quizTitle: table.quiz.title
		})
		.from(table.quizResult)
		.innerJoin(table.quiz, eq(table.quizResult.quizId, table.quiz.id))
		.where(eq(table.quizResult.userId, event.locals.user.id))
		.orderBy(desc(table.quizResult.completedAt))
		.limit(5);

	const recentResults = results.map((r) => ({
		...r,
		percentage: Math.round((r.score / r.totalQuestions) * 100)
	}));

	return {
		user: event.locals.user,
		quizzes: quizzesWithCounts,
		recentResults
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return redirect(302, '/login');
		}

		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	}
};
