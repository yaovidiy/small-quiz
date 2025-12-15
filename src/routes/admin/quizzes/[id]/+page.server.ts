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

	const quizId = event.params.id;

	// Fetch quiz
	const quizzes = await db.select().from(table.quiz).where(eq(table.quiz.id, quizId));
	if (quizzes.length === 0) {
		return redirect(302, '/admin/quizzes');
	}

	const quiz = quizzes[0];

	// Fetch all questions with their answers
	const questions = await db.select().from(table.question).where(eq(table.question.quizId, quizId)).orderBy(table.question.order);

	const questionsWithAnswers = await Promise.all(
		questions.map(async (question) => {
			const answers = await db
				.select()
				.from(table.answer)
				.where(eq(table.answer.questionId, question.id))
				.orderBy(table.answer.order);
			return {
				...question,
				answers
			};
		})
	);

	return {
		quiz,
		questions: questionsWithAnswers
	};
};

export const actions: Actions = {
	updateQuiz: async (event) => {
		const formData = await event.request.formData();
		const quizId = formData.get('quizId') as string;
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;

		if (!title) {
			return { error: 'Title is required' };
		}

		try {
			await db.update(table.quiz).set({ title, description: description || null }).where(eq(table.quiz.id, quizId));
			return { success: true };
		} catch (e) {
			return { error: 'Failed to update quiz' };
		}
	},
	createQuestion: async (event) => {
		const formData = await event.request.formData();
		const quizId = formData.get('quizId') as string;
		const text = formData.get('text') as string;
		const type = formData.get('type') as string;

		if (!text) {
			return { error: 'Question text is required' };
		}

		try {
			// Get the next order number
			const questions = await db.select().from(table.question).where(eq(table.question.quizId, quizId));
			const nextOrder = questions.length;

			const questionId = encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));

			await db.insert(table.question).values({
				id: questionId,
				quizId,
				text,
				type: type || 'multiple-choice',
				order: nextOrder
			});

			return { success: true, questionId };
		} catch (e) {
			return { error: 'Failed to create question' };
		}
	},
	updateQuestion: async (event) => {
		const formData = await event.request.formData();
		const questionId = formData.get('questionId') as string;
		const text = formData.get('text') as string;
		const type = formData.get('type') as string;

		try {
			await db.update(table.question).set({ text, type }).where(eq(table.question.id, questionId));
			return { success: true };
		} catch (e) {
			return { error: 'Failed to update question' };
		}
	},
	deleteQuestion: async (event) => {
		const formData = await event.request.formData();
		const questionId = formData.get('questionId') as string;

		try {
			// Delete answers first
			await db.delete(table.answer).where(eq(table.answer.questionId, questionId));
			// Delete question
			await db.delete(table.question).where(eq(table.question.id, questionId));
			return { success: true };
		} catch (e) {
			return { error: 'Failed to delete question' };
		}
	},
	createAnswer: async (event) => {
		const formData = await event.request.formData();
		const questionId = formData.get('questionId') as string;
		const text = formData.get('text') as string;
		const isCorrect = formData.get('isCorrect') === 'true';

		if (!text) {
			return { error: 'Answer text is required' };
		}

		try {
			// Get the next order number
			const answers = await db.select().from(table.answer).where(eq(table.answer.questionId, questionId));
			const nextOrder = answers.length;

			const answerId = encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));

			await db.insert(table.answer).values({
				id: answerId,
				questionId,
				text,
				isCorrect,
				order: nextOrder
			});

			return { success: true, answerId };
		} catch (e) {
			return { error: 'Failed to create answer' };
		}
	},
	updateAnswer: async (event) => {
		const formData = await event.request.formData();
		const answerId = formData.get('answerId') as string;
		const text = formData.get('text') as string;
		const isCorrect = formData.get('isCorrect') === 'true';

		try {
			await db.update(table.answer).set({ text, isCorrect }).where(eq(table.answer.id, answerId));
			return { success: true };
		} catch (e) {
			return { error: 'Failed to update answer' };
		}
	},
	deleteAnswer: async (event) => {
		const formData = await event.request.formData();
		const answerId = formData.get('answerId') as string;

		try {
			await db.delete(table.answer).where(eq(table.answer.id, answerId));
			return { success: true };
		} catch (e) {
			return { error: 'Failed to delete answer' };
		}
	}
};
