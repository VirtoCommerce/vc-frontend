import { InMemoryCache } from "@apollo/client/core";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";
import { useBroadcast, cacheReloadEvent } from "@/shared/broadcast";
import type { NormalizedCacheObject, Reference, Cache } from "@apollo/client/core";

class ThemeCache extends InMemoryCache {
  broadcast = useBroadcast();

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

  extract(optimistic: boolean = false): NormalizedCacheObject {
    return super.extract(optimistic);
  }

  restore(data: NormalizedCacheObject): this {
    const result = super.restore(data);
    this.broadcastWatches();
    return result;
  }
}

class ThemeCacheWrapper extends LocalStorageWrapper {
  removeItem(key: string): void {
    console.log("removeItem");
    super.removeItem(key);
  }

  setItem(key: string, value: string | null): void {
    if (super.getItem(key) === value) {
      console.log("setItem");
    }
    super.setItem(key, value);
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

export const cachePersistor = new CachePersistor({
  cache,
  debounce: 0,
  key: "cache",
  maxSize: false,
  storage: new ThemeCacheWrapper(window.localStorage),
});
