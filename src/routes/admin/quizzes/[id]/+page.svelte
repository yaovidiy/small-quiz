<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let editingQuiz = $state(false);
	let quizTitle = $state(data.quiz.title);
	let quizDescription = $state(data.quiz.description || '');

	let expandedQuestion: string | null = $state(null);
	let newQuestionText = $state('');
	let newQuestionType = $state('multiple-choice');
	let showNewQuestionForm = $state(false);

	let newAnswerText: Record<string, string> = $state({});
	let newAnswerIsCorrect: Record<string, boolean> = $state({});
	let showNewAnswerForm: Record<string, boolean> = $state({});

	const questionTypes = ['multiple-choice', 'true-false', 'short-answer'];
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header -->
	<header class="bg-white shadow-md sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold text-indigo-600">Edit Quiz</h1>
				<p class="text-sm text-gray-600">{data.quiz.title}</p>
			</div>
			<a
				href="/admin/quizzes"
				class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200 text-sm"
			>
				Back to Quizzes
			</a>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<!-- Quiz Details -->
		<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
			{#if editingQuiz}
				<form method="POST" action="?/updateQuiz" use:enhance class="space-y-4">
					<h2 class="text-2xl font-bold text-gray-800 mb-6">Edit Quiz Details</h2>

					<input type="hidden" name="quizId" value={data.quiz.id} />

					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
							Quiz Title
						</label>
						<input
							id="title"
							name="title"
							type="text"
							bind:value={quizTitle}
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
							Description
						</label>
						<textarea
							id="description"
							name="description"
							bind:value={quizDescription}
							rows="3"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
						></textarea>
					</div>

					<div class="flex gap-3">
						<button
							type="submit"
							class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200"
						>
							Save Changes
						</button>
						<button
							type="button"
							onclick={() => (editingQuiz = false)}
							class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200"
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<div class="flex justify-between items-start">
					<div>
						<h2 class="text-2xl font-bold text-gray-800 mb-2">{data.quiz.title}</h2>
						<p class="text-gray-600">{data.quiz.description || 'No description'}</p>
					</div>
					<button
						type="button"
						onclick={() => (editingQuiz = true)}
						class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200"
					>
						Edit Quiz
					</button>
				</div>
			{/if}
		</div>

		<!-- Questions Section -->
		<div class="bg-white rounded-lg shadow-lg overflow-hidden">
			<div class="p-6 sm:p-8">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl font-bold text-gray-800">Questions ({data.questions.length})</h2>
					<button
						type="button"
						onclick={() => (showNewQuestionForm = !showNewQuestionForm)}
						class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200 text-sm"
					>
						{showNewQuestionForm ? 'Cancel' : '+ Add Question'}
					</button>
				</div>

				<!-- New Question Form -->
				{#if showNewQuestionForm}
					<form method="POST" action="?/createQuestion" use:enhance class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
						<h3 class="font-bold text-gray-800 mb-4">Create New Question</h3>

						<input type="hidden" name="quizId" value={data.quiz.id} />

						<div class="mb-4">
							<label for="text" class="block text-sm font-medium text-gray-700 mb-2">
								Question Text *
							</label>
							<textarea
								id="text"
								name="text"
								bind:value={newQuestionText}
								required
								rows="3"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
								placeholder="Enter the question text..."
							></textarea>
						</div>

						<div class="mb-4">
							<label for="type" class="block text-sm font-medium text-gray-700 mb-2">
								Question Type
							</label>
							<select
								id="type"
								name="type"
								bind:value={newQuestionType}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
							>
								{#each questionTypes as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>

						<div class="flex gap-3">
							<button
								type="submit"
								class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200"
								onclick={() => {
									newQuestionText = '';
									newQuestionType = 'multiple-choice';
									showNewQuestionForm = false;
								}}
							>
								Create Question
							</button>
							<button
								type="button"
								onclick={() => (showNewQuestionForm = false)}
								class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200"
							>
								Cancel
							</button>
						</div>
					</form>
				{/if}

				<!-- Questions List -->
				{#if data.questions.length === 0}
					<p class="text-gray-600 text-center py-8">No questions yet. Create your first question to get started!</p>
				{:else}
					<div class="space-y-4">
						{#each data.questions as question (question.id)}
							<div class="border border-gray-200 rounded-lg overflow-hidden">
								<!-- Question Header -->
								<button
									type="button"
									onclick={() => (expandedQuestion = expandedQuestion === question.id ? null : question.id)}
									class="w-full text-left px-4 sm:px-6 py-4 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
								>
									<div class="flex-1">
										<p class="font-semibold text-gray-800">{question.text}</p>
										<p class="text-xs text-gray-500 mt-1">
											Type: {question.type} | Answers: {question.answers.length}
										</p>
									</div>
									<span class="text-xl text-gray-600">
										{expandedQuestion === question.id ? '▼' : '▶'}
									</span>
								</button>

								<!-- Question Details -->
								{#if expandedQuestion === question.id}
									<div class="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white space-y-4">
										<!-- Edit Question -->
										<form method="POST" action="?/updateQuestion" use:enhance class="mb-4 p-4 bg-blue-50 rounded-lg">
											<input type="hidden" name="questionId" value={question.id} />

											<div class="mb-3">
												<label class="block text-sm font-medium text-gray-700 mb-1">
													Question Text
												</label>
												<textarea
													name="text"
													value={question.text}
													rows="2"
													class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
												></textarea>
											</div>

											<div class="mb-3">
												<label class="block text-sm font-medium text-gray-700 mb-1">
													Type
												</label>
												<select
													name="type"
													value={question.type}
													class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
												>
													{#each questionTypes as type}
														<option value={type}>{type}</option>
													{/each}
												</select>
											</div>

											<button
												type="submit"
												class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition duration-200"
											>
												Save Question
											</button>
										</form>

										<!-- Answers -->
										<div class="mt-4">
											<h4 class="font-semibold text-gray-800 mb-3">Answers</h4>
											<div class="space-y-2 mb-4">
												{#each question.answers as answer (answer.id)}
													<div class="flex items-start justify-between p-3 bg-gray-50 rounded border border-gray-200">
														<div class="flex-1">
															<p class="text-sm font-medium text-gray-800">{answer.text}</p>
															<p class="text-xs text-gray-600 mt-1">
																{answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
															</p>
														</div>
														<div class="flex gap-2">
															<form method="POST" action="?/updateAnswer" use:enhance class="inline">
																<input type="hidden" name="answerId" value={answer.id} />
																<input type="hidden" name="text" value={answer.text} />
																<input type="hidden" name="isCorrect" value={String(!answer.isCorrect)} />
																<button
																	type="submit"
																	class="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded transition duration-200"
																>
																	{answer.isCorrect ? 'Mark Wrong' : 'Mark Correct'}
																</button>
															</form>
															<form method="POST" action="?/deleteAnswer" use:enhance class="inline">
																<input type="hidden" name="answerId" value={answer.id} />
																<button
																	type="submit"
																	class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition duration-200"
																	onclick={(e) => {
																		if (!confirm('Delete this answer?')) {
																			e.preventDefault();
																		}
																	}}
																>
																	Delete
																</button>
															</form>
														</div>
													</div>
												{/each}
											</div>

											<!-- Add Answer Form -->
											{#if showNewAnswerForm[question.id]}
												<form method="POST" action="?/createAnswer" use:enhance class="p-3 bg-green-50 rounded border border-green-200">
													<input type="hidden" name="questionId" value={question.id} />

													<div class="mb-2">
														<label class="block text-sm font-medium text-gray-700 mb-1">
															Answer Text *
														</label>
														<input
															type="text"
															name="text"
															bind:value={newAnswerText[question.id]}
															required
															class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
															placeholder="Enter answer text..."
														/>
													</div>

													<div class="mb-3">
														<label class="flex items-center text-sm font-medium text-gray-700">
															<input
																type="checkbox"
																name="isCorrect"
																bind:checked={newAnswerIsCorrect[question.id]}
																value="true"
																class="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
															/>
															<span class="ml-2">This is the correct answer</span>
														</label>
													</div>

													<div class="flex gap-2">
														<button
															type="submit"
															class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded transition duration-200"
															onclick={() => {
																showNewAnswerForm[question.id] = false;
																newAnswerText[question.id] = '';
																newAnswerIsCorrect[question.id] = false;
															}}
														>
															Add Answer
														</button>
														<button
															type="button"
															onclick={() => (showNewAnswerForm[question.id] = false)}
															class="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded transition duration-200"
														>
															Cancel
														</button>
													</div>
												</form>
											{:else}
												<button
													type="button"
													onclick={() => (showNewAnswerForm[question.id] = true)}
													class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded transition duration-200"
												>
													+ Add Answer
												</button>
											{/if}
										</div>

										<!-- Delete Question -->
										<div class="mt-4 pt-4 border-t border-gray-200">
											<form method="POST" action="?/deleteQuestion" use:enhance class="inline">
												<input type="hidden" name="questionId" value={question.id} />
												<button
													type="submit"
													class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded transition duration-200"
													onclick={(e) => {
														if (!confirm('Delete this question and all its answers?')) {
															e.preventDefault();
														}
													}}
												>
													Delete Question
												</button>
											</form>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>
