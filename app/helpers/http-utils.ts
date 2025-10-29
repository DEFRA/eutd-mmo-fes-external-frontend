export const onGetResponse = async (response: Response): Promise<any> => {
  switch (response.status) {
    case 200:
      const data = await response.json();
      return data;
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status} with response ${response}`);
  }
};
