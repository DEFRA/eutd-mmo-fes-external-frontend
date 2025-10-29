interface ISpeciesError {
  key: string;
  value: string;
}

export const transformedErrors = (errors) => {
  const err =
    errors &&
    Object.keys(errors).reduce((acc, key) => {
      const error = errors[key];
      const newError: IError = {
        key: error.key,
        message: "",
      };
      let err = {};
      if (typeof error.message === "object" && error.message.translation) {
        newError.message = error.message.translation;
        if (error.message.possibleMatches) {
          err["dynamicValue"] = error.message.possibleMatches.join(", ");
          newError.value = err;
        }
      } else {
        newError.message = error.message;
      }
      acc[key] = newError;
      return acc;
    }, {});
  return err;
};

export const getKeysAndValues = (obj: any, prefix: string) => {
  const result: ISpeciesError = {
    key: "",
    value: "",
  };
  Object.keys(obj).forEach((key) => {
    if (key.startsWith(prefix)) {
      result["key"] = obj[key].message;
      result["value"] = obj[key].value ? obj[key].value.dynamicValue.split(",").join(", ") : null;
    }
  });
  return result;
};
