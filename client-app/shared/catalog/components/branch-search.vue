<template>
  <div class="flex items-center">
    <div
      class="flex-grow flex items-center mr-2 pl-4 pr-2.5 rounded border border-[color:var(--color-branch-dialog-input-border)] bg-white"
    >
      <input
        class="h-7 w-full text-[color:var(--color-branch-dialog-input-text)] outline-none bg-transparent text-xs"
        type="text"
        :placeholder="$t('shared.catalog.branches_dialog.search_input_placeholder')"
      />
      <button>
        <svg class="text-[color:var(--color-branch-dialog-input-reset-icon)]" width="10" height="10">
          <use href="/static/images/delete.svg#main"></use>
        </svg>
      </button>
    </div>
    <button class="w-7 h-7 rounded shadow-t-mds bg-white hover:bg-slate-50">
      <i class="fas fa-search text-primary" />
    </button>
  </div>
</template>
