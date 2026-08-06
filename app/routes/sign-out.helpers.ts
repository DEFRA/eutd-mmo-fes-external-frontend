export const decrementIdleTime = (previousIdleTime: number, secondInMilliseconds: number) =>
  previousIdleTime > 0 ? previousIdleTime - secondInMilliseconds : 0;

export const getWarningTimeToDisplay = (
  idleTime: number,
  minuteInMilliseconds: number,
  secondInMilliseconds: number,
  t: (key: string) => string
) =>
  idleTime > minuteInMilliseconds
    ? `${Math.ceil(idleTime / minuteInMilliseconds)} ${t("signOutMinutes")}`
    : `${idleTime / secondInMilliseconds} ${t("signOutSeconds")}`;
