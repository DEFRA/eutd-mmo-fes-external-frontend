import { useTranslation } from "react-i18next";
import type { IErrorsTransformed } from "~/types";
import { YesNoConfirmationPage } from "./yesNoConfirmationPage";

type RemoveStorageDocumentProductProps = {
  csrf: string;
  productId: string;
  backUrl: string;
  errors?: IErrorsTransformed;
  returnUrl?: string;
};

export const RemoveStorageDocumentProduct = ({
  csrf,
  productId,
  backUrl,
  errors,
  returnUrl,
}: RemoveStorageDocumentProductProps) => {
  const { t } = useTranslation(["sdRemoveProduct", "common"]);

  return (
    <YesNoConfirmationPage
      csrf={csrf}
      backUrl={backUrl}
      title={t("sdRemoveProductTitle", { ns: "sdRemoveProduct" })}
      hint={t("sdRemoveProductHint", { ns: "sdRemoveProduct" })}
      radioName="removeProduct"
      yesLabel={t("commonYesLabel", { ns: "common" })}
      noLabel={t("commonNoLabel", { ns: "common" })}
      errors={errors}
    >
      <input type="hidden" name="productId" value={productId} />
      {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}
    </YesNoConfirmationPage>
  );
};
