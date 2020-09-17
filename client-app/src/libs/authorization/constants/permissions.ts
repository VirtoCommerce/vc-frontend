export default class StorefrontPermissions {
  static CanSeeOrganizationDetail = "storefront:organization:view";
  static CanEditOrganization = "storefront:organization:edit";
  static CanInviteUsers = "storefront:user:invite";
  static CanCreateUsers = "storefront:user:create";
  static CanEditUsers = "storefront:user:edit";
  static CanDeleteUsers = "storefront:user:delete";
  static CanViewUsers = "storefront:user:view";
  static CanViewOrders = "storefront:order:view";
  static CanChangeOrderStatus = "storefront:order:changestatus";
}
