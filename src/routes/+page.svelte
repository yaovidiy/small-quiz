<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold text-indigo-600">Quiz Platform</h1>
				<p class="text-xs sm:text-sm text-gray-600">Test your knowledge</p>
			</div>
			<div class="flex flex-col sm:flex-row items-end sm:items-center gap-3">
				<div class="text-right">
					<p class="text-sm font-medium text-gray-800">Welcome, <span class="font-semibold text-indigo-600">{data.user?.username}</span></p>
				</div>
				{#if data.user?.isAdmin}
					<a
						href="/admin"
						class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200 text-sm"
					>
						Admin
					</a>
				{/if}
				<form method="POST" action="?/logout" use:enhance>
					<button
						type="submit"
						class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200 text-sm"
					>
						Logout
					</button>
				</form>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<!-- Hero Section -->
		<div class="text-center mb-12">
			<h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Available Quizzes</h2>
			<p class="text-gray-600 text-base sm:text-lg">Choose a quiz below to test your knowledge and see how you score!</p>
		</div>

		<!-- Quizzes Grid -->
		{#if data.quizzes && data.quizzes.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.quizzes as quiz (quiz.id)}
					<div class="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden group">
						<div class="h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
						<div class="p-6">
							<h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition">{quiz.title}</h3>
							<p class="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description || 'Test your knowledge on this topic'}</p>
							
							<div class="mb-4 text-xs text-gray-500">
								<span class="inline-block bg-gray-100 px-3 py-1 rounded-full">
									{quiz.questionCount} questions
								</span>
							</div>

							<a
								href={`/quiz/${quiz.id}`}
								class="inline-block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
							>
								Start Quiz
							</a>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="bg-white rounded-lg shadow-md p-12 text-center">
				<p class="text-gray-600 text-lg mb-4">No quizzes available yet.</p>
				<p class="text-gray-500">Check back soon for new quizzes!</p>
			</div>
		{/if}

		<!-- Recent Results Section -->
		{#if data.recentResults && data.recentResults.length > 0}
			<div class="mt-12">
				<h3 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Your Recent Results</h3>
				<div class="bg-white rounded-lg shadow-md overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead class="bg-gray-50 border-b">
								<tr>
									<th class="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Quiz</th>
									<th class="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Score</th>
									<th class="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Date</th>
								</tr>
							</thead>
							<tbody>
								{#each data.recentResults as result (result.id)}
									<tr class="border-b hover:bg-gray-50 transition">
										<td class="px-4 sm:px-6 py-3 text-gray-800 font-medium">{result.quizTitle}</td>
										<td class="px-4 sm:px-6 py-3">
											<span class="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold"
												class:bg-green-500={result.percentage >= 70}
												class:bg-yellow-500={result.percentage >= 50 && result.percentage < 70}
												class:bg-red-500={result.percentage < 50}
											>
												{result.score}/{result.totalQuestions} ({result.percentage}%)
											</span>
										</td>
										<td class="px-4 sm:px-6 py-3 text-gray-600 text-xs sm:text-sm">
											{new Date(result.completedAt).toLocaleDateString()}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
