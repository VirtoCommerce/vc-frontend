/* eslint-disable @typescript-eslint/ban-types */
import { describe, it, expectTypeOf } from "vitest";
import type { DeepOmitByType, DeepPartial } from "./utility";

interface IContact {
  phone: string;
  emails: string[];
}

interface IAddress {
  address: string;
  city: string;
  country: string;
  contacts: IContact[];
}

interface IParent {
  name: string;
}

interface IPerson {
  name: string;
  age: number;
  jobs: string[];
  address: IAddress;
  parents: IParent[];
}

describe("DeepPartial", () => {
  it("should make all properties optional", () => {
    expectTypeOf({}).toMatchTypeOf<DeepPartial<IPerson>>();
  });

  it("should make nested properties optional", () => {
    expectTypeOf({ address: {} }).toMatchTypeOf<DeepPartial<IPerson>>();
  });

  it("should make deeply nested properties optional", () => {
    expectTypeOf({ address: { contacts: [] } }).toMatchTypeOf<DeepPartial<IPerson>>();
  });
});

describe("DeepOmitByType", () => {
  it("should omit properties with primitive type", () => {
    interface IImmortal {
      name: string;
      jobs: string[];
      address: IAddress;
      parents: IParent[];
    }

    interface IHaveAge {
      age: number;
    }

    expectTypeOf<IImmortal>().toEqualTypeOf<DeepOmitByType<IPerson, IHaveAge>>();
  });

  it("should omit properties with array type", () => {
    interface IUnemployed {
      name: string;
      age: number;
      address: IAddress;
      parents: IParent[];
    }

    interface IHaveJob {
      jobs: string[];
    }

    expectTypeOf<IUnemployed>().toEqualTypeOf<DeepOmitByType<IPerson, IHaveJob>>();
  });

  it("should omit nested properties with primitive type", () => {
    interface IHomeless {
      name: string;
      age: number;
      jobs: string[];
      address: {
        city: string;
        country: string;
        contacts: IContact[];
      };
      parents: IParent[];
    }

    interface IHaveProperty {
      address: {
        address: string;
      };
    }

    expectTypeOf<IHomeless>().toEqualTypeOf<DeepOmitByType<IPerson, IHaveProperty>>();
  });

  it("should omit nested properties with array type", () => {
    interface IDownshifter {
      name: string;
      age: number;
      jobs: string[];
      address: {
        address: string;
        city: string;
        country: string;
      };
      parents: IParent[];
    }

    interface IHasContacts {
      address: {
        contacts: IContact[];
      };
    }

    expectTypeOf<IDownshifter>().toEqualTypeOf<DeepOmitByType<IPerson, IHasContacts>>();
  });

  // it("should omit deep nested properties with primitive type", () => {
  //   interface IBoomer {
  //     name: string;
  //     age: number;
  //     jobs: string[];
  //     address: {
  //       lines: string[];
  //       city: string;
  //       country: string;
  //       contacts: {
  //         phone: string;
  //         emails: string[];
  //       };
  //     };
  //     parents: IParent[];
  //   }

  //   interface IHasEmailAddress {
  //     address: {
  //       contacts: {
  //         emails: string[];
  //       };
  //     };
  //   }

  //   // TODO: Stopped here

  //   expectTypeOf<IBoomer>().toMatchTypeOf<DeepOmitByType<IPerson, IHasEmailAddress>>();
  // });

  // it("should omit deep nested properties with array type", () => {
  //   interface IHomeless {
  //     name: string;
  //     age: number;
  //     jobs: string[];
  //     address: IAddress;
  //     parents: IParent[];
  //   }

  //   interface IHasProperty {
  //     address: {
  //       lines: string[];
  //     };
  //   }

  //   expectTypeOf<IHomeless>().toMatchTypeOf<DeepOmitByType<IPerson, IHasProperty>>();
  // });

  // it("should omit properties with primitive type within array type", () => {
  //   interface IDemigod {
  //     name: string;
  //     age: number;
  //     jobs: string[];
  //     address: IAddress;
  //     parents: {
  //       name: string;
  //     }[];
  //   }

  //   interface IHasMortalParents {
  //     parents: {
  //       age: number;
  //     }[];
  //   }

  //   expectTypeOf<IDemigod>().toMatchTypeOf<DeepOmitByType<IPerson, IHasMortalParents>>();
  // });
});
