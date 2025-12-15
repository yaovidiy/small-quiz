import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	// Verify user is admin
	if (!event.locals.user.isAdmin) {
		return redirect(302, '/');
	}

	// Fetch all quiz results with user and quiz information
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
		.orderBy(desc(table.quizResult.completedAt));

	return {
		results
	};
};
