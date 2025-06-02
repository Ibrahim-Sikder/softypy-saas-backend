export function buildSearchQuery(fields: string[], searchTerm?: string) {
  if (!searchTerm) return {};

  const escapedSearchTerm = searchTerm
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .trim();

  // Don't normalize the search term, keep it as is
  const searchRegex = new RegExp(escapedSearchTerm, "i");

  return {
    $or: fields.flatMap((field) => {
      if (field.includes(".")) {
        // Handle nested fields like vehicles.fullRegNum
        const [parent, child] = field.split(".");
        return [
          {
            [parent]: {
              $elemMatch: {
                [child]: searchRegex,
              },
            },
          },
          // Also search for the full field as a string
          { [field]: searchRegex }
        ];
      } else {
        // Handle direct fields
        return [{ [field]: searchRegex }];
      }
    }),
  };
}