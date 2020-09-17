import { Module } from "vuex";
import { defaultPageSize, draftsGridFields, startPageNumber, orderDraftType } from "core/constants";
import { localizeGridColumns } from "core/services/localization.helper.service";
import { RootState } from "store/types";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { DraftsListState } from "./types";

// initial state
export const initialState: DraftsListState = {
  isLoading: false,
  loaded: false,
  errors: null,
  columns: draftsGridFields,
  searchCriteria: {
    pageNumber: startPageNumber,
    pageSize: defaultPageSize,
    type: orderDraftType
  },
  drafts: {
    totalCount: 0,
    results: []
  },
  selectedDraft: null
};

const localizationdraftsGridColumnsNode = "account.drafts.grid.columns";

// We need this because bootstrap-vue will directly use labels on stacked table
initialState.columns = localizeGridColumns(localizationdraftsGridColumnsNode, initialState.columns);

const draftsListModule: Module<DraftsListState, RootState> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default draftsListModule;
