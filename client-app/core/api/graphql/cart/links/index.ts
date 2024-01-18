import { from } from "@apollo/client/core";
import { batchLink } from "@/core/api/graphql/cart/links/batch";
import { broadcastLink } from "@/core/api/graphql/cart/links/broadcast";

export const cartLink = from([broadcastLink, batchLink]);
