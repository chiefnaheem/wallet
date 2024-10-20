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
      name: 'Transactions',
      description: 'Operations related to Transactions',
    },
  ].sort((a: SwaggerTagType, b: SwaggerTagType): number =>
    a.name.localeCompare(b.name),
  );

  return tags;
};
