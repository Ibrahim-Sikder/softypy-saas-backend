const sanitizePayload = <T>(payload: Partial<T>): Partial<T> => {
  const payloadData: Partial<T> = { ...payload };
  for (const key in payloadData) {
    if (
      payloadData[key as keyof T] === '' ||
      payloadData[key as keyof T] === undefined
    ) {
      delete payloadData[key as keyof T];
    }
  }
  return payloadData;
};

export default sanitizePayload;
