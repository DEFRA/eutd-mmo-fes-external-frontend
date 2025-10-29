import {
  getCompletedPagination,
  paginationPreviousLinkDate,
  urlYear,
  urlMonthIndex,
  paginationNextLinkDate,
} from "./documentCompletedTable";
import { route } from "routes-gen";
import classNames from "classnames/bind";
import type { DashboardLinks } from "~/types";
import { format, getMonth, getYear } from "date-fns";

export const PageNavigationLinks = (
  t: any,
  searchParams: URLSearchParams,
  journeyLink: any,
  journeyName: string
): DashboardLinks => ({
  previousLink: () => (
    <a
      className="govuk-link govuk-pagination__link"
      href={`${route(journeyLink)}?month=${format(
        paginationPreviousLinkDate(searchParams),
        "MM"
      )}&year=${format(paginationPreviousLinkDate(searchParams), "y")}&position=0`}
      rel="next"
      aria-label={t("commonDashboardPrev", { ns: "common" })}
    >
      <svg
        className="govuk-pagination__icon govuk-pagination__icon--prev"
        xmlns="http://www.w3.org/2000/svg"
        height="13"
        width="15"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 15 13"
      >
        <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
      </svg>
      <span className="govuk-pagination__link-title">{t("commonDashboardPrev", { ns: "common" })}</span>
    </a>
  ),
  monthlyLinks: () =>
    getCompletedPagination(searchParams).map((i: string, index: number) => {
      const dateI = new Date(i);
      const formattedDate = format(new Date(urlYear(searchParams), urlMonthIndex(searchParams), 1), "MMM y");
      return (
        <li
          key={i}
          className={classNames("govuk-pagination__item", {
            " govuk-pagination__item--current": i === formattedDate,
            " govuk-pagination--block": i !== formattedDate,
          })}
        >
          <a
            data-testid={`${journeyName}-monthly-link-${getMonth(dateI) + 1}-${getYear(dateI)}`}
            className="govuk-link govuk-pagination__link"
            href={`${route(journeyLink)}?month=${getMonth(dateI) + 1}&year=${getYear(dateI)}&position=${index}`}
            aria-label={i}
          >
            {i}
          </a>
        </li>
      );
    }),
  nextLink: () => (
    <a
      className="govuk-link govuk-pagination__link"
      href={`${route(journeyLink)}?month=${format(
        paginationNextLinkDate(searchParams),
        "MM"
      )}&year=${format(paginationNextLinkDate(searchParams), "y")}&position=0`}
      rel="previous"
      aria-label={t("commonDashboardNext", { ns: "common" })}
    >
      {" "}
      <span className="govuk-pagination__link-title ">{t("commonDashboardNext", { ns: "common" })}</span>{" "}
      <svg
        className="govuk-pagination__icon govuk-pagination__icon--next"
        xmlns="http://www.w3.org/2000/svg"
        height="13"
        width="15"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 15 13"
      >
        <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
      </svg>
    </a>
  ),
});
