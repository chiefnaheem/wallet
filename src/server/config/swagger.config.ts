type SwaggerTagType = {
  name: string;
  description: string;
};

export const swaggerTags = (): Array<SwaggerTagType> => {
  const tags: Array<SwaggerTagType> = [
    { name: 'User', description: 'Operations related to the user' },
    {
      name: 'Auth',
      description: 'Operations related to the user-authentication',
    },
    {
      name: 'Social Login',
      description: 'Operations related to the social login',
    },
    {
      name: 'Ride Preference',
      description: 'Operations related to the ridePreference',
    },
    {
      name: 'Vehicle Type',
      description: 'Operations related to the vehicle type',
    },
    {
      name: 'Logistics',
      description: 'Operations related to the logistics',
    },
    {
      name: 'Routes',
      description: 'Operations related to routes',
    },
    {
      name: 'Delivery',
      description: 'Operations related to delivery',
    },
    {
      name: 'Transportation',
      description: 'Operations related to transportation',
    },
    {
      name: 'App',
      description: 'Operations at the base',
    },
    {
      name: 'SavedDestinations',
      description: 'Operations related to saving destinations',
    },
    {
      name: 'Chat/Channel',
      description: 'Operations related to sendbird chat channel',
    },
    {
      name: 'Chat/User',
      description: 'Operations related to sendbird chat user',
    },
    {
      name: 'Chat/Message',
      description: 'Operations related to sendbird chat message',
    },
    {
      name: 'Ride Request',
      description: 'Operations related to ride request',
    },
    {
      name: 'Call',
      description: 'Operations related to sendbird call',
    },
    {
      name: 'Onesignal/User',
      description: 'Operations related to onesignal notification user',
    },
    {
      name: 'Onesignal/Subscription',
      description: 'Operations related to onesignal notification subscription',
    },
    {
      name: 'Fcm',
      description: 'Operations related to firebase push notification service',
    },
    {
      name: 'Utility',
      description:
        "Utility controller for returning data that doesn't need to be retrieved frequently",
    },
    {
      name: 'Payment',
      description: 'Operations related to all payment',
    },
    {
      name: 'Products',
      description: 'Operations related to all raffle product',
    },
    {
      name: 'Orders',
      description: 'Operations related to all orders',
    },
    {
      name: 'Wallet',
      description: 'Operations related to all Wallet',
    },
    {
      name: 'Commission',
      description: "Operations related to user's commission",
    },
    {
      name: 'Operator',
      description: 'Operations related to Operator',
    },
    {
      name: 'Vehicle Brand',
      description: 'Operations related to Vehicle Brand',
    },
  ].sort((a: SwaggerTagType, b: SwaggerTagType): number =>
    a.name.localeCompare(b.name),
  );

  return tags;
};
