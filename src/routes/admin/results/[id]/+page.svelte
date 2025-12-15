<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const calculatePercentage = (score: number, total: number) => {
		return Math.round((score / total) * 100);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const percentage = calculatePercentage(data.result.score, data.result.totalQuestions);
	const passed = percentage >= 70;
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-indigo-600">{data.result.quizTitle}</h1>
				<p class="text-gray-600 text-sm">User: {data.result.userName}</p>
			</div>
			<a
				href="/admin/results"
				class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200 text-sm"
			>
				Back
			</a>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Result Summary -->
		<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
				<div class="text-center">
					<p class="text-gray-600 text-sm font-medium">Score</p>
					<p class="text-3xl font-bold text-indigo-600 mt-1">{data.result.score}/{data.result.totalQuestions}</p>
				</div>
				<div class="text-center">
					<p class="text-gray-600 text-sm font-medium">Percentage</p>
					<p
						class="text-3xl font-bold mt-1"
						class:text-green-600={passed}
						class:text-red-600={!passed}
					>
						{percentage}%
					</p>
				</div>
				<div class="text-center">
					<p class="text-gray-600 text-sm font-medium">Status</p>
					<p
						class="text-lg font-bold mt-1"
						class:text-green-600={passed}
						class:text-red-600={!passed}
					>
						{passed ? 'PASSED' : 'FAILED'}
					</p>
				</div>
				<div class="text-center">
					<p class="text-gray-600 text-sm font-medium">Completed</p>
					<p class="text-sm text-gray-700 mt-1">{formatDate(data.result.completedAt)}</p>
				</div>
			</div>
		</div>

		<!-- Questions and Answers -->
		<div class="space-y-6">
			{#each data.questions as question, index}
				<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8">
					<div class="flex items-start justify-between mb-4">
						<h2 class="text-lg sm:text-xl font-bold text-gray-800 flex-1">
							{index + 1}. {question.text}
						</h2>
						<span
							class="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0"
							class:bg-green-100={question.isCorrect}
							class:text-green-800={question.isCorrect}
							class:bg-red-100={!question.isCorrect}
							class:text-red-800={!question.isCorrect}
						>
							{question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
						</span>
					</div>

					<!-- Answer Options -->
					<div class="space-y-3">
						{#each question.answers as answer}
							{@const isSelected = answer.id === question.userAnswerId}
							{@const isCorrect = answer.isCorrect}
							<div
								class="p-4 border-2 rounded-lg transition"
								class:border-green-500={isCorrect && !isSelected}
								class:bg-green-50={isCorrect && !isSelected}
								class:border-green-600={isCorrect && isSelected}
								class:bg-green-100={isCorrect && isSelected}
								class:border-red-500={!isCorrect && isSelected}
								class:bg-red-50={!isCorrect && isSelected}
								class:border-gray-200={!isSelected && !isCorrect}
								class:bg-gray-50={!isSelected && !isCorrect}
							>
								<div class="flex items-center justify-between">
									<span class="text-gray-800 font-medium text-sm sm:text-base">{answer.text}</span>
									<div class="flex items-center gap-2">
										{#if isSelected}
											<span class="text-sm font-semibold" class:text-green-700={isCorrect} class:text-red-700={!isCorrect}>
												{isCorrect ? '✓ User Selected' : '✗ User Selected'}
											</span>
										{/if}
										{#if isCorrect && !isSelected}
											<span class="text-sm font-semibold text-green-700">✓ Correct Answer</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>
