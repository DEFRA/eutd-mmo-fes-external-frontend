import { useState } from "react";
import { FormInput } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const EMOJI_REGEX = /\p{Extended_Pictographic}|[\u{FE0E}\u{FE0F}\u{200D}]|[\u{1F1E0}-\u{1F1FF}]/u;

function containsEmoji(value: string): boolean {
  return EMOJI_REGEX.test(value);
}

function stripEmojis(value: string): string {
  return value.replace(EMOJI_REGEX, "");
}

type FormInputProps = React.ComponentProps<typeof FormInput>;

/**
 * Drop-in replacement for FormInput that immediately blocks emoji input.
 *
 * On every change and paste event the input value is checked for emoji /
 * unsupported Unicode pictographics. If any are found they are stripped in
 * place and an inline "Emojis are not permitted" error is displayed for that
 * field alone. Focus is kept on the field so the user can continue editing.
 *
 * All props are forwarded to the underlying FormInput unchanged, so this
 * component can be aliased as FormInput at the import site with no JSX edits.
 */
export const EmojiBlockingInput = ({
  inputProps = {},
  staticErrorMessage,
  errorProps = {},
  containerClassNameError,
  inputClassName,
  ...rest
}: FormInputProps) => {
  const { t } = useTranslation();
  const [emojiError, setEmojiError] = useState(false);

  const inputAttrs = inputProps as React.InputHTMLAttributes<HTMLInputElement>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (containsEmoji(e.target.value)) {
      e.target.value = stripEmojis(e.target.value);
      setEmojiError(true);
      e.target.focus();
    } else {
      setEmojiError(false);
    }
    inputAttrs.onChange?.(e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (containsEmoji(pasted)) {
      e.preventDefault();
      const stripped = stripEmojis(pasted);
      const target = e.currentTarget as HTMLInputElement;
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      target.value = target.value.slice(0, start) + stripped + target.value.slice(end);
      target.setSelectionRange(start + stripped.length, start + stripped.length);
      setEmojiError(true);
    }
    inputAttrs.onPaste?.(e as unknown as React.ClipboardEvent<HTMLInputElement>);
  };

  const errorMessage = emojiError ? t("emojisAreNotPermitted", { ns: "errorsText" }) : staticErrorMessage;

  const mergedInputClassName = emojiError ? classNames(inputClassName, "govuk-input--error") : inputClassName;

  const mergedContainerClassNameError = emojiError ? "govuk-form-group--error" : containerClassNameError;

  const mergedErrorProps = emojiError ? { className: "govuk-error-message" } : (errorProps as Record<string, string>);

  return (
    <FormInput
      {...rest}
      inputClassName={mergedInputClassName}
      containerClassNameError={mergedContainerClassNameError}
      staticErrorMessage={errorMessage}
      errorProps={mergedErrorProps}
      inputProps={{
        ...inputAttrs,
        onChange: handleChange,
        onPaste: handlePaste,
      }}
    />
  );
};
