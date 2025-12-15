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
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-indigo-600">All Quiz Results</h1>
			</div>
			<a
				href="/admin"
				class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200 text-sm"
			>
				Back to Admin
			</a>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if data.results.length === 0}
			<div class="bg-white rounded-lg shadow-lg p-8 text-center">
				<p class="text-gray-600 text-lg">No quiz results found yet.</p>
			</div>
		{:else}
			<!-- Results Table -->
			<div class="bg-white rounded-lg shadow-lg overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-indigo-600 text-white">
							<tr>
								<th class="px-4 sm:px-6 py-4 text-left text-sm font-semibold">User</th>
								<th class="px-4 sm:px-6 py-4 text-left text-sm font-semibold">Quiz</th>
								<th class="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Score</th>
								<th class="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Percentage</th>
								<th class="px-4 sm:px-6 py-4 text-left text-sm font-semibold">Completed</th>
								<th class="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.results as result}
								{@const percentage = calculatePercentage(result.score, result.totalQuestions)}
								{@const passed = percentage >= 70}
								<tr class="hover:bg-gray-50 transition">
									<td class="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
										{result.userName}
									</td>
									<td class="px-4 sm:px-6 py-4 text-sm text-gray-700">
										{result.quizTitle}
									</td>
									<td class="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-gray-900">
										{result.score}/{result.totalQuestions}
									</td>
									<td class="px-4 sm:px-6 py-4 text-center">
										<span
											class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
											class:bg-green-100={passed}
											class:text-green-800={passed}
											class:bg-red-100={!passed}
											class:text-red-800={!passed}
										>
											{percentage}%
										</span>
									</td>
									<td class="px-4 sm:px-6 py-4 text-sm text-gray-600">
										{formatDate(result.completedAt)}
									</td>
									<td class="px-4 sm:px-6 py-4 text-center">
										<a
											href="/admin/results/{result.id}"
											class="inline-block px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-sm transition duration-200"
										>
											View
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Summary Stats -->
				<div class="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div>
							<p class="text-gray-600 text-sm font-medium">Total Results</p>
							<p class="text-2xl font-bold text-indigo-600 mt-1">{data.results.length}</p>
						</div>
						<div>
							<p class="text-gray-600 text-sm font-medium">Unique Users</p>
							<p class="text-2xl font-bold text-indigo-600 mt-1">
								{new Set(data.results.map((r) => r.userId)).size}
							</p>
						</div>
						<div>
							<p class="text-gray-600 text-sm font-medium">Avg Score</p>
							<p class="text-2xl font-bold text-indigo-600 mt-1">
								{Math.round(
									(data.results.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
										data.results.length) as number
								)}%
							</p>
						</div>
						<div>
							<p class="text-gray-600 text-sm font-medium">Pass Rate</p>
							<p class="text-2xl font-bold text-indigo-600 mt-1">
								{Math.round(
									(data.results.filter((r) => calculatePercentage(r.score, r.totalQuestions) >= 70).length /
										data.results.length) *
										100
								)}%
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>
