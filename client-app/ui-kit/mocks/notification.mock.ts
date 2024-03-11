export const unreadPushMessageMock: VcPushMessageType = {
  id: "111-222-333-444",
  shortMessage: 'You have <b>40 items</b> in your cart, don\'t forget to <b><a href="/cart">checkout</a></b>.',
  createdDate: new Date("2024-02-28T07:58:19.1545801Z"),
};

export const readPushMessageMock: VcPushMessageType = {
  id: "222-333-444-555",
  shortMessage:
    "**31 new agencies** are available on **OMNIA** Partners Connect 31 new agencies are available on OMNIA. **Partners** Connect 31 new agencies are available on OMNIA Partners Connect",
  read: true,
  createdDate: new Date("2024-02-28T07:58:19.1545801Z"),
};
