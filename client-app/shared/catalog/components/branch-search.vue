<template>
  <div class="flex items-center">
    <div
      class="h-11 sm:h-auto flex-grow flex items-center mr-2 pl-4 pr-4 sm:pr-2.5 rounded border border-[color:var(--color-branch-dialog-input-border)] bg-white"
    >
      <input
        class="h-full sm:h-7 w-full text-[color:var(--color-branch-dialog-input-text)] outline-none bg-transparent text-sm sm:text-xs"
        type="text"
        :placeholder="$t('shared.catalog.branches_dialog.search_input_placeholder')"
      />
      <button>
        <svg class="w-3 h-3 text-[color:var(--color-branch-dialog-input-reset-icon)] sm:w-2.5 sm:h-2.5">
          <use href="/static/images/delete.svg#main"></use>
        </svg>
      </button>
    </div>
    <button class="w-11 h-11 sm:w-7 sm:h-7 rounded shadow-t-mds bg-primary sm:bg-white hover:bg-slate-50">
      <i class="fas fa-search text-white sm:text-primary text-xl sm:text-base" />
    </button>
  </div>
</template>
