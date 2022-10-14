export enum StorefrontPermissions {
  CanSeeOrganizationDetail = "storefront:organization:view",
  CanEditOrganization = "storefront:organization:edit",
  CanInviteUsers = "storefront:user:invite",
  CanCreateUsers = "storefront:user:create",
  CanEditUsers = "storefront:user:edit",
  CanDeleteUsers = "storefront:user:delete",
  CanViewUsers = "storefront:user:view",
  CanViewOrders = "storefront:order:view",
  CanChangeOrderStatus = "storefront:order:changestatus",
}

export enum XApiPermissions {
  CanEditOrganization = "xapi:my_organization:edit",
}
