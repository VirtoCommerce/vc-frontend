import { ServerError } from "@/core/api/common/enums";
import {
  TabsType,
  forbiddenEvent,
  unauthorizedErrorEvent,
  unhandledErrorEvent,
  useBroadcast,
} from "@/shared/broadcast";

export function errorHandler(error: ServerError | undefined, errorData?: string) {
  const broadcast = useBroadcast();

  switch (error) {
    case ServerError.Unhandled:
      void broadcast.emit(unhandledErrorEvent, errorData, TabsType.ALL);
      break;
    case ServerError.Unauthorized:
      void broadcast.emit(unauthorizedErrorEvent, errorData, TabsType.ALL);
      break;
    case ServerError.Forbidden:
      void broadcast.emit(forbiddenEvent, errorData, TabsType.CURRENT);
      break;
  }
}
