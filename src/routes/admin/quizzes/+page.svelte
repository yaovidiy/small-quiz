<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showCreateForm = $state(false);
	let title = $state('');
	let description = $state('');
	let isSubmitting = $state(false);

	const handleCreateQuiz = async () => {
		if (!title.trim()) return;
		isSubmitting = true;
	};

	const handleDeleteQuiz = async (quizId: string) => {
		if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
			// Form will handle the deletion
		}
	};
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold text-indigo-600">Quiz Management</h1>
				<p class="text-sm text-gray-600">Create and manage quizzes</p>
			</div>
			<a
				href="/admin"
				class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200 text-sm"
			>
				Back to Admin
			</a>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<!-- Create Quiz Form -->
		{#if showCreateForm}
			<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
				<h2 class="text-2xl font-bold text-gray-800 mb-6">Create New Quiz</h2>

				<form
					method="POST"
					action="?/createQuiz"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								const data = result.data as { quizId: string };
								title = '';
								description = '';
								showCreateForm = false;
								// Navigate to edit page
								goto(`/admin/quizzes/${data.quizId}`);
							}
						};
					}}
					class="space-y-4"
				>
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
							Quiz Title *
						</label>
						<input
							id="title"
							name="title"
							type="text"
							bind:value={title}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
							placeholder="e.g., JavaScript Basics"
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
							Description (optional)
						</label>
						<textarea
							id="description"
							name="description"
							bind:value={description}
							rows="4"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
							placeholder="Describe what this quiz is about..."
						></textarea>
					</div>

					<div class="flex gap-3">
						<button
							type="submit"
							disabled={!title.trim() || isSubmitting}
							class="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200"
						>
							{isSubmitting ? 'Creating...' : 'Create Quiz'}
						</button>
						<button
							type="button"
							onclick={() => {
								showCreateForm = false;
								title = '';
								description = '';
							}}
							class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		{:else}
			<div class="mb-8">
				<button
					type="button"
					onclick={() => (showCreateForm = true)}
					class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
				>
					+ Create New Quiz
				</button>
			</div>
		{/if}

		<!-- Quizzes List -->
		<div class="bg-white rounded-lg shadow-lg overflow-hidden">
			<div class="p-6 sm:p-8">
				<h2 class="text-2xl font-bold text-gray-800 mb-6">All Quizzes</h2>

				{#if data.quizzes.length === 0}
					<p class="text-gray-600 text-center py-8">No quizzes yet. Create your first quiz to get started!</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead class="bg-gray-50 border-b">
								<tr>
									<th class="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Title</th>
									<th class="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Description</th>
									<th class="px-4 sm:px-6 py-3 text-center font-semibold text-gray-700">Questions</th>
									<th class="px-4 sm:px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each data.quizzes as quiz (quiz.id)}
									<tr class="border-b hover:bg-gray-50 transition">
										<td class="px-4 sm:px-6 py-4 font-medium text-gray-800">{quiz.title}</td>
										<td class="px-4 sm:px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
											{quiz.description || '—'}
										</td>
										<td class="px-4 sm:px-6 py-4 text-center">
											<span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
												{quiz.questionCount}
											</span>
										</td>
										<td class="px-4 sm:px-6 py-4 text-center space-x-2">
											<a
												href={`/admin/quizzes/${quiz.id}`}
												class="inline-block px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition duration-200"
											>
												Edit
											</a>
											<form
												method="POST"
												action="?/deleteQuiz"
												class="inline"
												onsubmit={(e) => {
													if (!confirm('Are you sure you want to delete this quiz?')) {
														e.preventDefault();
													}
												}}
											>
												<input type="hidden" name="quizId" value={quiz.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition duration-200"
												>
													Delete
												</button>
											</form>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>
