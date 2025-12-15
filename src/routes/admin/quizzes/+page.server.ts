import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	// Check if user is admin
	if (!event.locals.user.isAdmin) {
		return redirect(302, '/');
	}

	const quizzes = await db.select().from(table.quiz);

	// Get question count for each quiz
	const quizzesWithCounts = await Promise.all(
		quizzes.map(async (quiz) => {
			const questions = await db
				.select()
				.from(table.question)
				.where(eq(table.question.quizId, quiz.id));
			return {
				...quiz,
				questionCount: questions.length
			};
		})
	);

	return {
		quizzes: quizzesWithCounts
	};
};

export const actions: Actions = {
	createQuiz: async (event) => {
		const formData = await event.request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;

		if (!title) {
			return { error: 'Title is required' };
		}

		const quizId = encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));

		try {
			await db.insert(table.quiz).values({
				id: quizId,
				title,
				description: description || null,
				createdAt: new Date()
			});

			return { success: true, quizId };
		} catch (e) {
			return { error: 'Failed to create quiz' };
		}
	},
	deleteQuiz: async (event) => {
		const formData = await event.request.formData();
		const quizId = formData.get('quizId') as string;

		try {
			// Delete all related data
			const questions = await db.select().from(table.question).where(eq(table.question.quizId, quizId));

			for (const question of questions) {
				await db.delete(table.answer).where(eq(table.answer.questionId, question.id));
			}

			await db.delete(table.question).where(eq(table.question.quizId, quizId));
			await db.delete(table.userQuiz).where(eq(table.userQuiz.quizId, quizId));
			await db.delete(table.quizResult).where(eq(table.quizResult.quizId, quizId));
			await db.delete(table.quiz).where(eq(table.quiz.id, quizId));

			return { success: true };
		} catch (e) {
			return { error: 'Failed to delete quiz' };
		}
	}
};
