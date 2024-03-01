import { InMemoryCache } from "@apollo/client/core";
import { useBroadcast, cacheReloadEvent } from "@/shared/broadcast";
import type { NormalizedCacheObject, Reference, Cache } from "@apollo/client/core";

class ThemeCache extends InMemoryCache {
  broadcast = useBroadcast();

  gc(options?: { resetResultCache?: boolean; resetResultIdentities?: boolean }): string[] {
    const result = super.gc(options);
    console.log("gc");
    this.broadcast.emit(cacheReloadEvent);
    return result;
  }

  evict(options: Cache.EvictOptions): boolean {
    const result = super.evict(options);
    console.log("evict");
    this.broadcast.emit(cacheReloadEvent);
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modify<Entity extends Record<string, any> = Record<string, any>>(options: Cache.ModifyOptions<Entity>): boolean {
    const result = super.modify(options);
    console.log("modify");
    this.broadcast.emit(cacheReloadEvent);
    return result;
  }

  write(options: Cache.WriteOptions): Reference | undefined {
    const result = super.write(options);
    console.log("write");
    this.broadcast.emit(cacheReloadEvent);
    return result;
  }

  restore(data: NormalizedCacheObject): this {
    const result = super.restore(data);
    this.broadcastWatches();
    return result;
  }
}

export const cache = new ThemeCache({
  typePolicies: {
    CartType: {
      fields: {
        availableGifts: {
          merge: false,
        },
        availableShippingMethods: {
          merge: false,
        },
        availablePaymentMethods: {
          merge: false,
        },
        coupons: {
          merge: false,
        },
        discounts: {
          merge: false,
        },
        gifts: {
          merge: false,
        },
        items: {
          merge: false,
        },
        payments: {
          merge: false,
        },
        shipments: {
          merge: false,
        },
        validationErrors: {
          merge: false,
        },
      },
    },
    CouponType: {
      keyFields: ["code"],
    },
    CurrencyType: {
      merge: false,
    },
    LineItemType: {
      fields: {
        validationErrors: {
          merge: false,
        },
      },
    },
    MoneyType: {
      merge: false,
    },
    PaymentMethodType: {
      keyFields: ["code"],
    },
    Product: {
      fields: {
        properties: {
          merge: false,
        },
      },
    },
    ValidationErrorType: {
      keyFields: ["errorCode", "objectId", "objectType"],
    },
  },
});
