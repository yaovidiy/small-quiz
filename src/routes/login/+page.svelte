<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { data, form } = $props();
	let isLogin = $state(true);
	let username = $state('');
	let password = $state('');
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-6">
	<div class="w-full max-w-md">
		<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8">
			<h1 class="text-3xl font-bold text-center text-gray-800 mb-2">
				{isLogin ? 'Login' : 'Register'}
			</h1>
			<p class="text-center text-gray-600 mb-6">Interview Quiz Platform</p>


			<form method='post' action={isLogin ? '?/login' : '?/register'} use:enhance class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
						Username
					</label>
					<input
						id="username"
						name='username'
						type="text"
						bind:value={username}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
						placeholder="Enter your username"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Password
					</label>
					<input
						id="password"
						name='password'
						type='password'
						bind:value={password}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
						placeholder="Enter your password"
					/>
				</div>

				{#if form?.message}
					<div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{form.message}
					</div>
				{/if}

				<div class="flex gap-3 pt-2">
					<button
						type="submit"
						formaction={isLogin ? '?/login' : '?/register'}
						class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
					>
						{isLogin ? 'Login' : 'Register'}
					</button>
					<button
						type="button"
						onclick={() => {
							isLogin = !isLogin;
							username = '';
							password = '';
						}}
						class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
					>
						{isLogin ? 'Need account?' : 'Have account?'}
					</button>
				</div>
			</form>

			<p class="text-xs text-gray-500 text-center mt-6">
				{isLogin ? 'New user? Click "Need account?" to register' : 'Create your account to start taking quizzes'}
			</p>
		</div>
	</div>
</div>
