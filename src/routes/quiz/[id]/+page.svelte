<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let currentQuestionIndex = $state(0);
	let answers = $state<Record<string, string | string[]>>({});
	let isSubmitted = $state(false);

	const currentQuestion = $derived(data.questions[currentQuestionIndex]);
	const progress = $derived(((currentQuestionIndex + 1) / data.questions.length) * 100);

	// Check if question has multiple correct answers
	const hasMultipleCorrectAnswers = $derived(
		currentQuestion.answers.filter((a) => a.isCorrect).length > 1
	);

	const handleAnswerChange = (questionId: string, answerId: string, isCheckbox: boolean) => {
		if (isCheckbox) {
			// Handle checkbox (multiple selection)
			const currentAnswers = Array.isArray(answers[questionId]) ? answers[questionId] : [];
			if (currentAnswers.includes(answerId)) {
				answers[questionId] = (currentAnswers as string[]).filter((id) => id !== answerId);
			} else {
				answers[questionId] = [...currentAnswers, answerId];
			}
		} else {
			// Handle radio button (single selection)
			answers[questionId] = answerId;
		}
	};

	const isAnswerSelected = (questionId: string, answerId: string) => {
		const answer = answers[questionId];
		if (Array.isArray(answer)) {
			return answer.includes(answerId);
		}
		return answer === answerId;
	};

	const handleNext = () => {
		if (currentQuestionIndex < data.questions.length - 1) {
			currentQuestionIndex++;
		}
	};

	const handlePrev = () => {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
		}
	};

	const handleSubmit = () => {
		isSubmitted = true;
		const form = document.getElementById('submitForm') as HTMLFormElement;
		if (form) {
			form.submit();
		}
	};

	const allAnswered = $derived(data.questions.every((q) => {
		const answer = answers[q.id];
		if (Array.isArray(answer)) {
			return answer.length > 0;
		}
		return answer;
	}));
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-indigo-600">{data.quiz.title}</h1>
			</div>
			<a
				href="/"
				class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200 text-sm"
			>
				Exit
			</a>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !isSubmitted}
			<!-- Progress Bar -->
			<div class="mb-8">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-semibold text-gray-700">
						Question {currentQuestionIndex + 1} of {data.questions.length}
					</span>
					<span class="text-sm font-semibold text-indigo-600">{Math.round(progress)}%</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-2">
					<div
						class="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
						style="width: {progress}%"
					></div>
				</div>
			</div>

            {#key currentQuestion.id}
			<!-- Question Card -->
			<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
				<h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
					{currentQuestion.text}
				</h2>

				<!-- Answer Options -->
				{#if currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false'}
					<div class="space-y-4">
					{#each currentQuestion.answers as answer (answer.id)}
						<label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition" class:border-indigo-500={isAnswerSelected(currentQuestion.id, answer.id)} class:bg-indigo-50={isAnswerSelected(currentQuestion.id, answer.id)}>
							<input
								type={hasMultipleCorrectAnswers ? 'checkbox' : 'radio'}
								name={`question-${currentQuestion.id}`}
								value={answer.id}
								checked={isAnswerSelected(currentQuestion.id, answer.id)}
								onchange={() => handleAnswerChange(currentQuestion.id, answer.id, hasMultipleCorrectAnswers)}
									class="w-4 h-4 text-indigo-600 cursor-pointer"
								/>
								<span class="ml-3 text-gray-800 font-medium text-sm sm:text-base">{answer.text}</span>
							</label>
						{/each}
					</div>
				{:else if currentQuestion.type === 'short-answer'}
					<input
						type="text"
						placeholder="Enter your answer..."
						value={answers[currentQuestion.id] || ''}
						onchange={(e) => handleAnswerChange(currentQuestion.id, e.currentTarget.value)}
						class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition text-sm sm:text-base"
					/>
				{/if}
			</div>
            {/key}

			<!-- Navigation Buttons -->
			<div class="flex gap-3 flex-col sm:flex-row">
				<button
					onclick={handlePrev}
					disabled={currentQuestionIndex === 0}
					class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition duration-200 text-sm"
				>
					← Previous
				</button>

				<button
					onclick={handleNext}
					disabled={currentQuestionIndex === data.questions.length - 1}
					class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 text-sm"
				>
					Next →
				</button>

				{#if currentQuestionIndex === data.questions.length - 1}
					<button
						onclick={handleSubmit}
						disabled={!allAnswered}
						class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 text-sm"
					>
						Submit Quiz
					</button>
				{/if}
			</div>

			<!-- Answer Summary -->
			<div class="mt-8 bg-white rounded-lg shadow p-6">
				<h3 class="font-bold text-gray-800 mb-4 text-sm sm:text-base">Questions Answered: {Object.keys(answers).length}/{data.questions.length}</h3>
				<div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
					{#each data.questions as question, index (question.id)}
						<button
							onclick={() => (currentQuestionIndex = index)}
							class="aspect-square rounded-lg font-semibold text-xs transition hover:scale-110"
							class:bg-green-500={answers[question.id]}
						class:text-white={answers[question.id] || currentQuestionIndex === index}
						class:bg-gray-200={!answers[question.id]}
						class:bg-indigo-600={currentQuestionIndex === index && answers[question.id]}
						class:bg-indigo-400={currentQuestionIndex === index && !answers[question.id]}
						>
							{index + 1}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Submit Form -->
			<form method="POST" action="?/submit" use:enhance id="submitForm" class="hidden">
				<input type="hidden" name="quizId" value={data.quiz.id} />
				{#each Object.entries(answers) as [questionId, answerIdOrIds]}
					{#if Array.isArray(answerIdOrIds)}
						{#each answerIdOrIds as answerId}
							<input type="hidden" name="answers" value={`${questionId}:${answerId}`} />
						{/each}
					{:else}
						<input type="hidden" name="answers" value={`${questionId}:${answerIdOrIds}`} />
					{/if}
				{/each}
			</form>

			<!-- Confirmation Message -->
			<div class="bg-white rounded-lg shadow-lg p-8 text-center">
				<div class="mb-6">
					<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
						<svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					</div>
				</div>
				<h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
				<p class="text-gray-600 mb-8 text-sm sm:text-base">
					You've answered all {data.questions.length} questions. Your responses are being processed.
				</p>

				<button
					form="submitForm"
					type="submit"
					class="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 text-sm sm:text-base"
				>
					View Results
				</button>
			</div>
		{/if}
	</main>
</div>
