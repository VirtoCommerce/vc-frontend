export type PushMessageType = {
  id: string;
  createdDate: number | Date;
  isRead?: boolean;
  shortMessage: string;
  isHidden?: boolean;
};
