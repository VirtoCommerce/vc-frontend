<template>
  <div class="wishlist-card">
    <div class="wishlist-card__title-row">
      <router-link :to="{ name: 'ListDetails', params: { listId: list.id } }" class="wishlist-card__title">
        {{ list.name }}
      </router-link>

      <VcBadge class="wishlist-card__badge" variant="outline-dark" color="info" rounded>
        {{ list.itemsCount }}
      </VcBadge>
    </div>

    <div class="wishlist-card__description" :class="{ 'wishlist-card__description--empty': !list.description }">
      {{ list.description }}
    </div>

    <div class="wishlist-card__meta-row">
      <div class="wishlist-card__date">
        <VcIcon :size="16" name="save-v2" class="text-info-400" />

        <b>{{ $d(list.modifiedDate, "short") }}</b>
      </div>

      <div class="wishlist-card__status">
        <WishlistStatus v-if="isCorporateMember && list.sharingSetting" :sharing-setting="list.sharingSetting" />
      </div>
    </div>

    <div class="wishlist-card__dropdown">
      <WishlistDropdownMenu
        v-if="list.sharingSetting?.access === WishlistAccessType.Write"
        @edit="$emit('settings')"
        @remove="$emit('remove')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WishlistAccessType } from "@/core/api/graphql/types";
import { useUser } from "@/shared/account/composables";
import WishlistDropdownMenu from "./wishlist-dropdown-menu.vue";
import WishlistStatus from "./wishlist-status.vue";
import type { WishlistType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "settings"): void;
  (event: "remove"): void;
}

interface IProps {
  list: WishlistType;
}

defineEmits<IEmits>();

defineProps<IProps>();

const { isCorporateMember } = useUser();
</script>

<style lang="scss">
.wishlist-card {
  @apply relative rounded-[--vc-radius] bg-additional-50 p-4 text-sm shadow-md;

  @container (min-width: theme("containers.xl")) {
    @apply grid items-center gap-x-6 px-5;

    grid-column: 1 / -1;
    grid-template-columns: subgrid;
  }

  &__title-row {
    @apply flex items-center gap-2 pe-10;

    @container (min-width: theme("containers.xl")) {
      @apply min-w-0 pe-0;
    }
  }

  &__title {
    @apply truncate text-base font-bold text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__badge {
    @apply shrink-0;
  }

  &__description {
    @apply truncate pe-10;

    @container (min-width: theme("containers.xl")) {
      @apply pe-0;
    }

    &--empty {
      @apply hidden;

      @container (min-width: theme("containers.xl")) {
        @apply block;
      }
    }
  }

  &__meta-row {
    @apply flex items-center pt-4;

    @container (min-width: theme("containers.xl")) {
      @apply contents pt-0;
    }
  }

  &__date {
    @apply flex items-center gap-1.5;
  }

  &__status {
    @apply ms-auto;

    @container (min-width: theme("containers.xl")) {
      @apply ms-0;
    }
  }

  &__dropdown {
    @apply absolute right-4 top-4;

    @container (min-width: theme("containers.xl")) {
      @apply static;
    }
  }
}
</style>
