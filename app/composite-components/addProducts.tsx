import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigation } from "@remix-run/react";
import { useHydrated } from "remix-utils/use-hydrated";
import { type Navigation } from "@remix-run/router";
import type { IErrorsTransformed, LabelAndValue, SearchState, Species } from "~/types";
import { AddProductsComponent } from "./addProductsComponent";
import isEmpty from "lodash/isEmpty";
import { getCodeFromLabel } from "~/helpers";
import logger from "~/logger";

type AddProductsProps = {
  speciesExemptLink: string;
  species: Species[];
  states: LabelAndValue[];
  presentations: LabelAndValue[];
  selectedSpecies: string;
  selectedState: string;
  selectedPresentation: string;
  selectedCommodityCode: string;
  commodityCodes: LabelAndValue[];
  errors: IErrorsTransformed;
  stateLabel: string;
  presentationLabel: string;
  scientificName: string;
  speciesCode: string;
  primaryButtonLabel: string;
  displayAddProduct: boolean;
  isEdit?: boolean;
  addToFavourites: boolean;
  showFavouriteCheckbox: boolean;
};

type dropdownInputPropsType = {
  value?: string;
  defaultValue?: string;
};

async function getCommodityCodes(
  abortControllerRef: any,
  cleanup: () => void,
  commonSpecies: string,
  getSelectedState: string,
  getSelectedPresentation: string,
  setCommodityCode: (commodityCodes: string) => void,
  setCommodityCodesHolder: (commodityCodes: []) => void
) {
  // Cancel previous request
  if (abortControllerRef.current) {
    cleanup();
  }

  // Create a new AbortController instance
  const controller = new AbortController();
  abortControllerRef.current = controller;
  const faoCode: string = getCodeFromLabel(commonSpecies);
  const url = `/get-commodity-codes?fao=${faoCode}&stateCode=${getSelectedState}&presentationCode=${getSelectedPresentation}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    const res = await response.json();
    const commodityCodes = res?.commodityCodes ?? [];
    const singleCommodityCode =
      Array.isArray(commodityCodes) && commodityCodes.length === 1 ? commodityCodes[0].value : "";

    if (singleCommodityCode) {
      setCommodityCode(singleCommodityCode);
    }
    setCommodityCodesHolder(commodityCodes);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e);
    }
  }
}
const hasResetProduct = (navigation: Navigation) =>
  navigation?.formData?.get("_action") === "addProduct" || navigation?.formData?.get("_action") === "cancel";

export const AddProducts = ({
  primaryButtonLabel,
  speciesExemptLink,
  species,
  states,
  presentations,
  selectedSpecies,
  selectedState,
  selectedPresentation,
  selectedCommodityCode,
  commodityCodes,
  errors,
  stateLabel,
  presentationLabel,
  scientificName,
  speciesCode,
  displayAddProduct,
  isEdit,
  addToFavourites,
  showFavouriteCheckbox,
}: AddProductsProps) => {
  const isHydrated = useHydrated();

  const [commonSpecies, setCommonSpecies] = useState<string>(selectedSpecies || "");
  const [currentStateLabel, setCurrentStateLabel] = useState<string>("");
  const [currentState, setCurrentState] = useState<string>(selectedState || "");
  const [currentPresentation, setCurrentPresentation] = useState<string>(selectedPresentation || "");
  const [currentPresentationLabel, setCurrentPresentationLabel] = useState<string>("");
  const [currentCommodityCode, setCurrentCommodityCode] = useState<string>(selectedCommodityCode || "");
  const [selectedSpeciesCode, setSelectedSpeciesCode] = useState<string>(speciesCode);
  const [speciesScientificName, setSpeciesScientificName] = useState<string>("");

  const [searchState, setSearchState] = useState<SearchState[]>();
  const [stateHolder, setStateHolder] = useState<LabelAndValue[]>(states || []);
  const [presentationHolder, setPresentationHolder] = useState<LabelAndValue[]>(presentations || []);
  const [commodityCodesHolder, setCommodityCodesHolder] = useState<LabelAndValue[]>(commodityCodes || []);

  let abortControllerRef = useRef<AbortController | null>(null);

  const navigation = useNavigation();
  const isReset: boolean = hasResetProduct(navigation);

  useEffect(() => {
    if (!isReset) {
      setCurrentState("");
      setCurrentPresentation("");
      setStateHolder([]);
      setPresentationHolder([]);
      setCommodityCodesHolder([]);
      setCurrentCommodityCode("");
      setCommonSpecies("");
    }
  }, [isReset]);

  const handleSpeciesSelection = (selectedValue: string) => {
    setSearchState([]);
    setCommonSpecies(selectedValue);
    setCurrentState("");
    setCurrentPresentation("");
    setStateHolder([]);
    setPresentationHolder([]);
    setCommodityCodesHolder([]);
    setCurrentCommodityCode("");
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentStateLabel((event.target as HTMLSelectElement).options[event.target.selectedIndex].text);
    setCurrentState(event.target.value);
    setPresentationHolder([]);
    setCurrentPresentation("");
    setCurrentPresentationLabel("");
    setCommodityCodesHolder([]);
    setCurrentCommodityCode("");
  };

  const handlePresentationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPresentation(event.target.value);
    setCurrentPresentationLabel((event.target as HTMLSelectElement).options[event.target.selectedIndex].text);
    setCommodityCodesHolder([]);
    setCurrentCommodityCode("");
  };

  const handleCommodityCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentCommodityCode(event.target.value);
  };

  const cleanup = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("Aborted");
      abortControllerRef.current = null;
    }
  };

  let getMomoizedCommodityCode = useCallback(
    () =>
      getCommodityCodes(
        abortControllerRef,
        cleanup,
        commonSpecies,
        currentState,
        currentPresentation,
        setCurrentCommodityCode,
        setCommodityCodesHolder
      ),
    [currentPresentation]
  );

  useEffect(() => {
    if (!isEmpty(commonSpecies) && !isEmpty(currentState) && !isEmpty(currentPresentation)) {
      getMomoizedCommodityCode();
    }

    return () => {
      cleanup();
    };
  }, [currentPresentation]);

  const getPresentations = async (): Promise<void> => {
    try {
      if (!searchState) return;
      const presentations: LabelAndValue[] =
        searchState.find((_: SearchState) => _.state.value === currentState)?.presentations ?? [];
      setPresentationHolder(presentations);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(e);
      }
    }
  };

  let getMemoizedPresentations = useCallback(() => getPresentations(), [commonSpecies, currentState]);

  useEffect(() => {
    if (!isEmpty(commonSpecies) && !isEmpty(currentState)) {
      getMemoizedPresentations();
    }

    return () => {
      cleanup();
    };
  }, [commonSpecies, currentState]);

  const getStates = async (): Promise<void> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      cleanup();
    }

    // Create a new AbortController instance
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const faoCode = getCodeFromLabel(commonSpecies);
      const response: Response = await fetch(`/get-species-state?fao=${faoCode}`, {
        signal: controller.signal,
      });
      const res: SearchState[] = await response.json();
      setSearchState(res);

      const states: LabelAndValue[] =
        res?.map((searchState: SearchState) => ({
          label: searchState.state.label,
          value: searchState.state.value,
        })) ?? [];

      setStateHolder(states || []);
      setSelectedSpeciesCode(faoCode || "");
      setSpeciesScientificName(res[0].scientificName || "");
    } catch (e) {
      if (e instanceof Error) {
        logger.error(e);
      }
    }
  };
  let getMomoizedStates = useCallback(() => getStates(), [commonSpecies]);

  useEffect(() => {
    if (!isEmpty(commonSpecies)) {
      getMomoizedStates();
    }

    return () => {
      cleanup();
    };
  }, [commonSpecies]);

  useEffect(() => setCommonSpecies(selectedSpecies), [selectedSpecies]);

  useEffect(() => {
    setStateHolder(states);
    setCurrentState(selectedState);
  }, [states, selectedState]);

  useEffect(() => {
    setPresentationHolder(presentations);
    setCurrentPresentation(selectedPresentation);
  }, [presentations, selectedPresentation]);

  useEffect(() => {
    setCommodityCodesHolder(commodityCodes);
    setCurrentCommodityCode(selectedCommodityCode);
  }, [commodityCodes, selectedCommodityCode]);

  const stateInputProps: dropdownInputPropsType = {};
  const presentationInputProps: dropdownInputPropsType = {};
  const commodityCodeInputProps: dropdownInputPropsType = {};

  if (isHydrated) {
    stateInputProps.value = currentState;
    presentationInputProps.value = currentPresentation;
    commodityCodeInputProps.value = currentCommodityCode;
  } else {
    stateInputProps.defaultValue = selectedState;
    presentationInputProps.defaultValue = selectedPresentation;
    let comodityCodeValue: any = "";
    if (Array.isArray(commodityCodes)) {
      if (commodityCodes.length === 1) {
        comodityCodeValue = commodityCodes[0].value;
      } else {
        comodityCodeValue = commodityCodes.find((c) => c.value === selectedCommodityCode)?.value;
      }
    }
    commodityCodeInputProps.defaultValue = comodityCodeValue;
  }

  return (
    <AddProductsComponent
      primaryButtonLabel={primaryButtonLabel}
      speciesExemptLink={speciesExemptLink}
      species={species}
      states={states}
      presentations={presentations}
      selectedSpecies={selectedSpecies}
      selectedState={selectedState}
      selectedPresentation={selectedPresentation}
      commodityCodes={commodityCodes}
      errors={errors}
      stateLabel={stateLabel}
      presentationLabel={presentationLabel}
      scientificName={scientificName}
      speciesCode={speciesCode}
      displayAddProduct={displayAddProduct}
      isEdit={isEdit}
      addToFavourites={addToFavourites}
      showFavouriteCheckbox={showFavouriteCheckbox}
      isHydrated={isHydrated}
      presentationInputProps={presentationInputProps}
      stateInputProps={stateInputProps}
      commodityCodeInputProps={commodityCodeInputProps}
      commonSpecies={commonSpecies}
      getSelectedState={currentState}
      getSelectedStateLabel={currentStateLabel}
      getSelectedPresentation={currentPresentation}
      getSelectedPresentationLabel={currentPresentationLabel}
      selectedSpeciesCode={selectedSpeciesCode}
      speciesScientificName={speciesScientificName}
      stateHolder={stateHolder}
      presentationHolder={presentationHolder}
      commodityCodesHolder={commodityCodesHolder}
      handleSpeciesSelection={handleSpeciesSelection}
      handleStateChange={handleStateChange}
      handlePresentationChange={handlePresentationChange}
      handleCommodityCodeChange={handleCommodityCodeChange}
    />
  );
};
