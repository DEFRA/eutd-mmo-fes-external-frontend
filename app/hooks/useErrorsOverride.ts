import { useEffect, useState } from "react";
import type { IErrorsTransformed } from "~/types";

/**
 * Custom hook for managing error override state
 * Allows child components to update errors immediately without server round-trip
 * Automatically resets overrides when actionData changes
 */
export const useErrorsOverride = (actionErrors?: IErrorsTransformed) => {
  const [errorsOverride, setErrorsOverride] = useState<IErrorsTransformed | undefined>(undefined);
  const errors = errorsOverride ?? actionErrors ?? {};

  useEffect(() => {
    setErrorsOverride(undefined);
  }, [actionErrors]);

  return { errors, setErrorsOverride };
};
