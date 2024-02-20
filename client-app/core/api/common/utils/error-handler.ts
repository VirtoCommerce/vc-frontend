import { ServerError } from "@/core/api/common/enums";
import {
  TabsType,
  forbiddenEvent,
  unauthorizedErrorEvent,
  unhandledErrorEvent,
  useBroadcast,
} from "@/shared/broadcast";

export function errorHandler(error: ServerError | undefined) {
  const broadcast = useBroadcast();

  switch (error) {
    case ServerError.Unhandled:
      broadcast.emit(unhandledErrorEvent, undefined, TabsType.ALL);
      break;
    case ServerError.Unauthorized:
      broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.ALL);
      break;
    case ServerError.Forbidden:
      broadcast.emit(forbiddenEvent, undefined, TabsType.CURRENT);
      break;
  }
}
