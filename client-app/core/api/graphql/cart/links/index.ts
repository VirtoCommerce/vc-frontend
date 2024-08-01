import { from } from "@apollo/client/core";
import { broadcastLink } from "@/core/api/graphql/cart/links/broadcast";

export const cartLink = from([broadcastLink]);
