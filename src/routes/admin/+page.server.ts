import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	// Check if user is admin
	if (!event.locals.user.isAdmin) {
		return redirect(302, '/');
	}

	// Fetch all users and quizzes
	const users = await db.select().from(table.user);
	const quizzes = await db.select().from(table.quiz);

	// Fetch user-quiz assignments
	const assignments = await db.select().from(table.userQuiz);

	return {
		users,
		quizzes,
		assignments
	};
};

export const actions: Actions = {
	assignQuiz: async (event) => {
		const formData = await event.request.formData();
		const userId = formData.get('userId') as string;
		const quizId = formData.get('quizId') as string;

		try {
			await db.insert(table.userQuiz).values({
				userId,
				quizId,
				assignedAt: new Date()
			});
		} catch (e) {
			// Quiz already assigned, ignore
		}

		return { success: true };
	},
	unassignQuiz: async (event) => {
		const formData = await event.request.formData();
		const userId = formData.get('userId') as string;
		const quizId = formData.get('quizId') as string;

		try {
			await db
				.delete(table.userQuiz)
				.where(
					and(
						eq(table.userQuiz.userId, userId),
						eq(table.userQuiz.quizId, quizId)
					)
				);
		} catch (e) {
			// Ignore errors
		}

		return { success: true };
	}
};
