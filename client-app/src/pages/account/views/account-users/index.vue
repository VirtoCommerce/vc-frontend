<template>
  <div class="mt-3">
    <add-user-modal @userAdded="userAdded($event)"></add-user-modal>
    <edit-user-modal :user="selectedUser"
                     :is-loading="isLoading"
                     @userChanged="userChanged($event)"></edit-user-modal>
    <div class="row flex-sm-row flex-column justify-content-between">
      <users-filter
        class="col col-sm-6 col-md-5 col-lg-3"
        :search-criteria="searchCriteria"
        @searchCriteriaChanged="searchCriteriaChanged"></users-filter>
      <div class="col col-sm-auto col-md-auto col-lg-auto align-self-sm-end mt-3">
        <b-button v-can="$permissions.CanCreateUsers"
                  v-b-modal.addUserModal
                  variant="outline-primary">
          {{ $t("account.users.add-user.add-user") }}
        </b-button>
      </div>
    </div>
    <div class="mt-3">
      <p>{{ $t("account.users.grid.text-above") }}</p>
      <b-overlay id="users-table"
                 :show="isLoading"
                 rounded="sm"
                 :variant="'white'"
                 :opacity="0.69">
        <b-table
          stacked="md"
          striped
          borderless
          hover
          tbody-tr-class="text-break"
          :show-empty="true"
          :empty-text="$t('account.users.no-users')"
          :items="users.results"
          :fields="columns"
          no-local-sorting
          @sort-changed="sortChanged">
          <template v-slot:cell(actions)="row">
            <div class="d-flex">
              <font-awesome-layers v-if="$can($permissions.CanEditUsers)"
                                   v-b-tooltip.hover
                                   :title="$t('account.users.edit-user-tooltip')"
                                   class="btn"
                                   @click="openEditUserModal(row.item)">
                <font-awesome-icon :icon="editIcon" size="lg"></font-awesome-icon>
              </font-awesome-layers>
              <font-awesome-layers
                v-if="$can($permissions.CanDeleteUsers) && !isCurrentUser(row.item)"
                v-b-tooltip.hover
                :title="$t('account.users.delete-user-tooltip')"
                class="btn"
                @click="confirmDeleteUser(row.item)">
                <font-awesome-icon :icon="deleteIcon" size="lg"></font-awesome-icon>
              </font-awesome-layers>
              <font-awesome-layers
                v-if="!row.item.isLockedOut && !isCurrentUser(row.item)"
                v-b-tooltip.hover
                :title="$t('account.users.suspend-user-tooltip')"
                class="btn"
                @click="changeUserSuspensionStatus(row.item, true)">
                <font-awesome-icon :icon="suspendIcon" size="lg"></font-awesome-icon>
              </font-awesome-layers>
              <font-awesome-layers
                v-if="row.item.isLockedOut && !isCurrentUser(row.item)"
                v-b-tooltip.hover
                :title="$t('account.users.unsuspend-user-tooltip')"
                class="btn"
                @click="changeUserSuspensionStatus(row.item, false)">
                <font-awesome-icon :icon="unsuspendIcon" size="lg"></font-awesome-icon>
              </font-awesome-layers>
            </div>
          </template>
        </b-table>

        <div class="d-flex justify-content-between">
          <b-pagination
            :value="searchCriteria.pageNumber"
            aria-controls="users-table"
            :total-rows="users.totalCount"
            :per-page="searchCriteria.pageSize"
            @change="pageChanged($event)"></b-pagination>
          <div>
            <b-dropdown
              id="page-sizes"
              class="form-control p-0"
              right
              variant="outline"
              menu-class="pt-0 pb-0"
              toggle-class="d-flex justify-content-between align-items-center">
              <template v-slot:button-content>
                {{ searchCriteria.pageSize }}
              </template>
              <b-dropdown-item
                v-for="pageSize in pageSizes"
                :key="pageSize"
                :active="checkActivePageSize(pageSize)"
                link-class="pr-0"
                @click="pageSizeChanged(pageSize)">
                {{ pageSize }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </b-overlay>
      <p>{{ $t("account.users.grid.text-below") }}</p>
    </div>
  </div>
</template>

<script lang="ts" src="./account-users.ts"></script>
