import { ServerError, HttpError } from "@/core/api/common/enums";

export function toServerError(error: unknown, status: number | undefined): ServerError | undefined {
  switch (status) {
    case HttpError.UNAUTHORIZED:
      return ServerError.Unauthorized;
    case HttpError.FORBIDDEN:
      return ServerError.Forbidden;
  }

  return ServerError.Unhandled;
}
