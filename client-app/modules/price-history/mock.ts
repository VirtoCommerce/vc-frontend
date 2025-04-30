/*export const mockPriceData = Array.from({ length: 15 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return {
    price: Math.round((Math.random() * 100 + 50) * 100) / 100, // Random price between 50 and 150
    date: date.toISOString(),
  };
}).reverse();*/

export const mockPriceDataById = {
  id1: [
    {
      price: 104.28,
      date: "2025-04-16T11:44:53.241Z",
    },
    {
      price: 104.23,
      date: "2025-04-17T11:44:53.241Z",
    },
    {
      price: 116.12,
      date: "2025-04-18T11:44:53.241Z",
    },
    {
      price: 149.54,
      date: "2025-04-19T11:44:53.241Z",
    },
    {
      price: 126.36,
      date: "2025-04-20T11:44:53.241Z",
    },
    {
      price: 139.01,
      date: "2025-04-21T11:44:53.241Z",
    },
    {
      price: 62.93,
      date: "2025-04-22T11:44:53.241Z",
    },
    {
      price: 72.35,
      date: "2025-04-23T11:44:53.241Z",
    },
    {
      price: 88.33,
      date: "2025-04-24T11:44:53.241Z",
    },
    {
      price: 119.26,
      date: "2025-04-25T11:44:53.241Z",
    },
    {
      price: 105.36,
      date: "2025-04-26T11:44:53.241Z",
    },
    {
      price: 133.34,
      date: "2025-04-27T11:44:53.241Z",
    },
    {
      price: 97.19,
      date: "2025-04-28T11:44:53.241Z",
    },
    {
      price: 135.23,
      date: "2025-04-29T11:44:53.241Z",
    },
    {
      price: 92.81,
      date: "2025-04-30T11:44:53.241Z",
    },
  ],
};
