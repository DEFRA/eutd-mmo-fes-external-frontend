export interface ILanguage {
  displayName: string;
  description: string;
}

export interface ILanguages {
  [key: string]: ILanguage;
}

export type ILanguageToggleProps = {
  languages: ILanguages;
  locale: string;
  params?: string;
};
