<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const percentage = Math.round((data.result.score / data.result.totalQuestions) * 100);
	const isPassed = percentage >= 70;
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
	<div class="w-full max-w-2xl">
		<!-- Result Card -->
		<div class="bg-white rounded-lg shadow-2xl overflow-hidden">
			<!-- Header with result color -->
			<div
				class="h-3"
				class:bg-green-500={isPassed}
				class:bg-red-500={!isPassed}
			></div>

			<div class="p-6 sm:p-10 text-center">
				<!-- Result Icon -->
				<div
					class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
					class:bg-green-100={isPassed}
					class:bg-red-100={!isPassed}
				>
					{#if isPassed}
						<svg class="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					{:else}
						<svg class="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
						</svg>
					{/if}
				</div>

				<!-- Title -->
				<h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
					{isPassed ? 'Excellent!' : 'Keep Trying!'}
				</h1>
				<p class="text-gray-600 text-sm sm:text-base mb-8">
					{isPassed
						? 'You passed the quiz with flying colors!'
						: 'You did not pass this time. Review and try again!'}
				</p>

				<!-- Score Display -->
				<div class="mb-8">
					<div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 sm:p-8">
						<p class="text-gray-600 text-sm mb-2">Your Score</p>
						<div class="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4">
							{percentage}%
						</div>
						<p class="text-lg sm:text-xl text-gray-700 font-semibold">
							{data.result.score} out of {data.result.totalQuestions} questions correct
						</p>
					</div>
				</div>

				<!-- Progress Indicators -->
				<div class="grid grid-cols-3 gap-4 mb-8">
					<div class="bg-gray-50 rounded-lg p-4">
						<p class="text-gray-600 text-xs sm:text-sm mb-1">Correct</p>
						<p class="text-2xl sm:text-3xl font-bold text-green-600">{data.result.score}</p>
					</div>
					<div class="bg-gray-50 rounded-lg p-4">
						<p class="text-gray-600 text-xs sm:text-sm mb-1">Incorrect</p>
						<p class="text-2xl sm:text-3xl font-bold text-red-600">
							{data.result.totalQuestions - data.result.score}
						</p>
					</div>
					<div class="bg-gray-50 rounded-lg p-4">
						<p class="text-gray-600 text-xs sm:text-sm mb-1">Total</p>
						<p class="text-2xl sm:text-3xl font-bold text-gray-700">{data.result.totalQuestions}</p>
					</div>
				</div>

				<!-- Quiz Info -->
				<div class="bg-gray-50 rounded-lg p-4 mb-8 text-left">
					<p class="text-sm text-gray-600"><strong>Quiz:</strong> {data.quiz.title}</p>
					<p class="text-sm text-gray-600">
						<strong>Completed:</strong> {new Date(data.result.completedAt).toLocaleString()}
					</p>
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-col sm:flex-row gap-4">
					<a
						href="/"
						class="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 text-center text-sm sm:text-base"
					>
						Back to Quizzes
					</a>
					{#if !isPassed}
						<a
							href={`/quiz/${data.quiz.id}`}
							class="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 text-center text-sm sm:text-base"
						>
							Retake Quiz
						</a>
					{/if}
				</div>
			</div>
		</div>

		<!-- Details Section (Optional) -->
		{#if data.userAnswers && data.userAnswers.length > 0}
			<div class="mt-8 bg-white rounded-lg shadow-lg p-6 sm:p-8">
				<h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Answer Review</h2>
				<div class="space-y-6">
					{#each data.userAnswers as answer, index (answer.id)}
						<div class="border-l-4 border-gray-200 pl-4 pb-4" class:border-green-500={answer.correct} class:border-red-500={!answer.correct}>
							<p class="font-semibold text-gray-800 text-sm sm:text-base mb-2">
								Question {index + 1}: {answer.questionText}
							</p>
							<p class="text-sm text-gray-600 mb-2">
								<strong>Your answer:</strong> {answer.userAnswerText}
								<span
									class="ml-2 px-2 py-1 rounded text-xs font-semibold text-white"
									class:bg-green-500={answer.correct}
									class:bg-red-500={!answer.correct}
								>
									{answer.correct ? '✓ Correct' : '✗ Incorrect'}
								</span>
							</p>
							{#if !answer.correct && answer.correctAnswerText}
								<p class="text-sm text-gray-600">
									<strong>Correct answer:</strong> {answer.correctAnswerText}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
