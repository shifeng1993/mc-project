<template>
	<div class="app">
		<Editor v-model="state"></Editor>
	</div>
</template>

<script lang="ts">
	import { defineComponent, provide, ref } from "vue";
	import data from "./data.json";
	import Editor from "./packages/editor.jsx";
	import registerConfig from "./utils/editor-config.jsx";

	export default defineComponent({
		components: {
			Editor,
		},
		setup() {
			const state = ref(data);

			provide("config", registerConfig); // 组件的配置传入

			return {
				state,
			};
		},
	});
</script>

<style lang="less">
	.app {
		position: fixed;
		top: 20px;
		left: 20px;
		right: 20px;
		bottom: 20px;
	}
</style>
