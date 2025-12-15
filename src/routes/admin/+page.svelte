<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedUser = $state<string | null>(null);
	let selectedQuiz = $state<string | null>(null);
	let showAssignmentSection = $state(true);

	const isAssigned = (userId: string, quizId: string) => {
		return data.assignments.some((a) => a.userId === userId && a.quizId === quizId);
	};
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold text-indigo-600">Admin Panel</h1>
				<p class="text-sm text-gray-600">Assign quizzes to users</p>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<!-- Navigation Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
			<!-- User-Quiz Assignment -->
			<div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 sm:p-8 text-white hover:shadow-xl transition">
				<h2 class="text-2xl font-bold mb-2">Assign Quizzes</h2>
				<p class="mb-6 opacity-90">Manage which quizzes are assigned to each user</p>
				<button
					onclick={() => (showAssignmentSection = !showAssignmentSection)}
					class="px-6 py-2 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition duration-200"
				>
					Manage Assignments
				</button>
			</div>

			<!-- Quiz Management -->
			<div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 sm:p-8 text-white hover:shadow-xl transition">
				<h2 class="text-2xl font-bold mb-2">Create & Edit Quizzes</h2>
				<p class="mb-6 opacity-90">Create new quizzes and manage questions & answers</p>
				<a
					href="/admin/quizzes"
					class="inline-block px-6 py-2 bg-white hover:bg-gray-100 text-green-600 font-semibold rounded-lg transition duration-200"
				>
					Go to Quiz Manager
				</a>
			</div>
		</div>
		<!-- Assignment Section -->
		{#if showAssignmentSection}
		<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
			<h2 class="text-2xl font-bold text-gray-800 mb-6">Assign Quiz to User</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Select User</label>
					<select
						bind:value={selectedUser}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
					>
						<option value={null}>Choose a user...</option>
						{#each data.users as user}
							<option value={user.id}>{user.username}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Select Quiz</label>
					<select
						bind:value={selectedQuiz}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
					>
						<option value={null}>Choose a quiz...</option>
						{#each data.quizzes as quiz}
							<option value={quiz.id}>{quiz.title}</option>
						{/each}
					</select>
				</div>

				<div class="flex items-end">
					<form method="POST" action="?/assignQuiz" use:enhance class="w-full">
						<input type="hidden" name="userId" value={selectedUser || ''} />
						<input type="hidden" name="quizId" value={selectedQuiz || ''} />
						<button
							type="submit"
							disabled={!selectedUser || !selectedQuiz}
							class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200"
						>
							Assign
						</button>
					</form>
				</div>
			</div>
		</div>

		<!-- Assignments Matrix -->
		<div class="bg-white rounded-lg shadow-lg overflow-hidden">
			<div class="p-6 sm:p-8">
				<h2 class="text-2xl font-bold text-gray-800 mb-6">User-Quiz Assignments</h2>

				{#if data.users.length === 0}
					<p class="text-gray-600">No users found.</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead class="bg-gray-50 border-b">
								<tr>
									<th class="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">User</th>
									{#each data.quizzes as quiz}
										<th class="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
											{quiz.title}
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each data.users as user}
									<tr class="border-b hover:bg-gray-50 transition">
										<td class="px-4 sm:px-6 py-4 font-medium text-gray-800">{user.username}</td>
										{#each data.quizzes as quiz}
											<td class="px-2 sm:px-4 py-4 text-center">
												{#if isAssigned(user.id, quiz.id)}
													<form method="POST" action="?/unassignQuiz" use:enhance class="inline">
														<input type="hidden" name="userId" value={user.id} />
														<input type="hidden" name="quizId" value={quiz.id} />
														<button
															type="submit"
															class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition duration-200"
														>
															Unassign
														</button>
													</form>
												{:else}
													<form method="POST" action="?/assignQuiz" use:enhance class="inline">
														<input type="hidden" name="userId" value={user.id} />
														<input type="hidden" name="quizId" value={quiz.id} />
														<button
															type="submit"
															class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition duration-200"
														>
															Assign
														</button>
													</form>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
		{/if}
	</main>
</div>
