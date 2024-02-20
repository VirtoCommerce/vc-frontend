/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { ServerError, HttpError } from "@/core/api/common/enums";

export function toServerError(error: unknown | undefined, status: number | undefined): ServerError | undefined {
  switch (status) {
    case undefined:
    case HttpError.SERVER_ERROR:
      return ServerError.Unhandled;
    case HttpError.UNAUTHORIZED:
      return ServerError.Unauthorized;
    case HttpError.FORBIDDEN:
      return ServerError.Forbidden;
  }
}
