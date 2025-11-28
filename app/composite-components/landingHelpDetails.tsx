import * as React from "react";
import { Details, List, ListItem, TYPE_LIST } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";

type LandingHelpDetailsProps = {
  namespace: string;
  headerKey: string;
  firstLineKey: string;
  secondLineKey: string;
  listItemKeys: string[];
  children?: React.ReactNode;
};

export const LandingHelpDetails = ({
  namespace,
  headerKey,
  firstLineKey,
  secondLineKey,
  listItemKeys,
  children,
}: LandingHelpDetailsProps) => {
  const { t } = useTranslation(namespace);

  return (
    <Details
      summary={t(headerKey)}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
    >
      <>
        <p>{t(firstLineKey)}</p>
        <p>{t(secondLineKey)}</p>
        <List type={TYPE_LIST.UNORDERED} className="govuk-list govuk-list--bullet">
          {listItemKeys.map((key) => (
            <ListItem key={key}>{t(key)}</ListItem>
          ))}
        </List>
        {children}
      </>
    </Details>
  );
};

export default LandingHelpDetails;
