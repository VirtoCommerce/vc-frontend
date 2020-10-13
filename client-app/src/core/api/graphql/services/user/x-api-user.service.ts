import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { OrganizationContactsSearchQuery } from "libs/user/models/types";
import {
  ContactQuery,
  ContactQueryVariables,
  OrganizationContactsQuery,
  OrganizationContactsQueryVariables,
  UserQuery,
  UserQueryVariables
} from "../../types";
import ConactQueryDocument from "./queries/contact.graphql";
import UserQueryDocument from "./queries/user.graphql";

export default class XApiUserService {
  constructor(
    private storeId: string,
    private cultureName: string,
    private currencyCode: string,
    private currentUserId: string,
    private client: ApolloClient<NormalizedCacheObject>
  ) {}

  async getCurrentUser() {
    const {
      data: { user }
    } = await this.client.query<UserQuery, UserQueryVariables>({
      query: UserQueryDocument,
      variables: {
        id: this.currentUserId
      }
    });
    return user!;
  }

  async getContactById(id: string) {
    const {
      data: { contact }
    } = await this.client.query<ContactQuery, ContactQueryVariables>({
      query: ConactQueryDocument,
      variables: {
        userId: this.currentUserId,
        id: id
      }
    });
    return contact!;
  }

  async searchOrgContacts(query: OrganizationContactsSearchQuery) {
    const {
      data: { organization }
    } = await this.client.query<OrganizationContactsQuery, OrganizationContactsQueryVariables>({
      query: ConactQueryDocument,
      variables: {
        userId: this.currentUserId,
        id: query.orgId,
        take: query.pageSize,
        skip: (query.pageNumber != null && query.pageSize != null
          ? query.pageNumber * query.pageSize
          : null
        )?.toString(),
        keyword: query.keyword
      }
    });
    return organization?.contacts!;
  }
}
