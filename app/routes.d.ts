declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/:journey/privacy-notice": { journey: string };
    "/:mode/export-certificates/:documentUri.pdf": { mode: string; documentUri: string };
    "/accessibility": Record<string, never>;
    "/admin-login": Record<string, never>;
    "/auth/openid/returnUri": Record<string, never>;
    "/cookies": Record<string, never>;
    "/create-catch-certificate/:documentNumber/add-exporter-details": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/add-landings": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/add-your-reference": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/catch-certificate-created": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/catch-certificate-pending": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/check-your-information": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/copy-this-catch-certificate": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/copy-void-confirmation": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/delete-this-draft-catch-certificate": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/direct-landing": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/do-you-have-additional-transport-types": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/landings-entry": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/landings-type-confirmation": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/manage-favourites": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/product-favourites": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/progress": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/upload-favourites": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/upload-file": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/upload-guidance": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/void-this-catch-certificate": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/what-are-you-exporting": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/what-export-journey": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/what-exporters-address": { documentNumber: string };
    "/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in": { documentNumber: string };
    "/create-catch-certificate/catch-certificates": Record<string, never>;
    "/create-processing-statement/:documentNumber/add-exporter-details": { documentNumber: string };
    "/create-processing-statement/:documentNumber/add-health-certificate": { documentNumber: string };
    "/create-processing-statement/:documentNumber/add-processing-plant-address": { documentNumber: string };
    "/create-processing-statement/:documentNumber/add-processing-plant-details": { documentNumber: string };
    "/create-processing-statement/:documentNumber/add-your-reference": { documentNumber: string };
    "/create-processing-statement/:documentNumber/catch-added": { documentNumber: string };
    "/create-processing-statement/:documentNumber/check-your-information": { documentNumber: string };
    "/create-processing-statement/:documentNumber/copy-this-processing-statement": { documentNumber: string };
    "/create-processing-statement/:documentNumber/copy-void-confirmation": { documentNumber: string };
    "/create-processing-statement/:documentNumber/delete-this-draft-processing-statement": { documentNumber: string };
    "/create-processing-statement/:documentNumber/processing-statement-created": { documentNumber: string };
    "/create-processing-statement/:documentNumber/progress": { documentNumber: string };
    "/create-processing-statement/:documentNumber/void-this-processing-statement": { documentNumber: string };
    "/create-processing-statement/:documentNumber/what-export-destination": { documentNumber: string };
    "/create-processing-statement/:documentNumber/what-exporters-address": { documentNumber: string };
    "/create-processing-statement/:documentNumber/what-processing-plant-address": { documentNumber: string };
    "/create-processing-statement/processing-statements": Record<string, never>;
    "/create-storage-document/:documentNumber/add-exporter-details": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-arrival-transportation-details-container-vessel": {
      documentNumber: string;
    };
    "/create-storage-document/:documentNumber/add-arrival-transportation-details-plane": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-arrival-transportation-details-train": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-arrival-transportation-details-truck": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-transportation-details-container-vessel": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-transportation-details-plane": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-transportation-details-train": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-transportation-details-truck": { documentNumber: string };
    "/create-storage-document/:documentNumber/departure-product-summary": { documentNumber: string };
    "/create-storage-document/:documentNumber/add-your-reference": { documentNumber: string };
    "/create-storage-document/:documentNumber/check-your-information": { documentNumber: string };
    "/create-storage-document/:documentNumber/copy-this-storage-document": { documentNumber: string };
    "/create-storage-document/:documentNumber/copy-void-confirmation": { documentNumber: string };
    "/create-storage-document/:documentNumber/delete-this-draft-storage-document": { documentNumber: string };
    "/create-storage-document/:documentNumber/do-you-have-a-road-transport-document": { documentNumber: string };
    "/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk": { documentNumber: string };
    "/create-storage-document/:documentNumber/progress": { documentNumber: string };
    "/create-storage-document/:documentNumber/storage-document-created": { documentNumber: string };
    "/create-storage-document/:documentNumber/void-this-storage-document": { documentNumber: string };
    "/create-storage-document/:documentNumber/what-exporters-address": { documentNumber: string };
    "/create-storage-document/:documentNumber/you-have-added-a-product": { documentNumber: string };
    "/create-storage-document/:documentNumber/you-have-added-a-storage-facility": { documentNumber: string };
    "/create-storage-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk": { documentNumber: string };
    "/create-storage-document/storage-documents": Record<string, never>;
    "/dev/null": Record<string, never>;
    "/forbidden/index": Record<string, never>;
    "/get-commodity-codes": Record<string, never>;
    "/get-gear-types": Record<string, never>;
    "/get-species-state": Record<string, never>;
    "/get-vessels": Record<string, never>;
    "/health": Record<string, never>;
    "/login/return": Record<string, never>;
    "/logout": Record<string, never>;
    "/manage-favourites": Record<string, never>;
    "/privacy-notice": Record<string, never>;
    "/service-improvement-plan": Record<string, never>;
    "/sign-out": Record<string, never>;
    "/there-is-a-problem-with-the-service": Record<string, never>;
  };

  export function route<
    T extends
      | ["/"]
      | ["/:journey/privacy-notice", RouteParams["/:journey/privacy-notice"]]
      | ["/:mode/export-certificates/:documentUri.pdf", RouteParams["/:mode/export-certificates/:documentUri.pdf"]]
      | ["/accessibility"]
      | ["/admin-login"]
      | ["/auth/openid/returnUri"]
      | ["/cookies"]
      | [
          "/create-catch-certificate/:documentNumber/add-exporter-details",
          RouteParams["/create-catch-certificate/:documentNumber/add-exporter-details"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/add-landings",
          RouteParams["/create-catch-certificate/:documentNumber/add-landings"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/add-your-reference",
          RouteParams["/create-catch-certificate/:documentNumber/add-your-reference"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/catch-certificate-created",
          RouteParams["/create-catch-certificate/:documentNumber/catch-certificate-created"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/catch-certificate-pending",
          RouteParams["/create-catch-certificate/:documentNumber/catch-certificate-pending"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/check-your-information",
          RouteParams["/create-catch-certificate/:documentNumber/check-your-information"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/copy-this-catch-certificate",
          RouteParams["/create-catch-certificate/:documentNumber/copy-this-catch-certificate"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/copy-void-confirmation",
          RouteParams["/create-catch-certificate/:documentNumber/copy-void-confirmation"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/delete-this-draft-catch-certificate",
          RouteParams["/create-catch-certificate/:documentNumber/delete-this-draft-catch-certificate"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/direct-landing",
          RouteParams["/create-catch-certificate/:documentNumber/direct-landing"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/do-you-have-additional-transport-types",
          RouteParams["/create-catch-certificate/:documentNumber/do-you-have-additional-transport-types"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/landings-entry",
          RouteParams["/create-catch-certificate/:documentNumber/landings-entry"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/landings-type-confirmation",
          RouteParams["/create-catch-certificate/:documentNumber/landings-type-confirmation"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/manage-favourites",
          RouteParams["/create-catch-certificate/:documentNumber/manage-favourites"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/product-favourites",
          RouteParams["/create-catch-certificate/:documentNumber/product-favourites"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/progress",
          RouteParams["/create-catch-certificate/:documentNumber/progress"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/upload-favourites",
          RouteParams["/create-catch-certificate/:documentNumber/upload-favourites"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/upload-file",
          RouteParams["/create-catch-certificate/:documentNumber/upload-file"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/upload-guidance",
          RouteParams["/create-catch-certificate/:documentNumber/upload-guidance"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/void-this-catch-certificate",
          RouteParams["/create-catch-certificate/:documentNumber/void-this-catch-certificate"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/what-are-you-exporting",
          RouteParams["/create-catch-certificate/:documentNumber/what-are-you-exporting"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/what-export-journey",
          RouteParams["/create-catch-certificate/:documentNumber/what-export-journey"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/what-exporters-address",
          RouteParams["/create-catch-certificate/:documentNumber/what-exporters-address"],
        ]
      | [
          "/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in",
          RouteParams["/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in"],
        ]
      | ["/create-catch-certificate/catch-certificates"]
      | [
          "/create-processing-statement/:documentNumber/add-exporter-details",
          RouteParams["/create-processing-statement/:documentNumber/add-exporter-details"],
        ]
      | [
          "/create-processing-statement/:documentNumber/add-health-certificate",
          RouteParams["/create-processing-statement/:documentNumber/add-health-certificate"],
        ]
      | [
          "/create-processing-statement/:documentNumber/add-processing-plant-address",
          RouteParams["/create-processing-statement/:documentNumber/add-processing-plant-address"],
        ]
      | [
          "/create-processing-statement/:documentNumber/add-processing-plant-details",
          RouteParams["/create-processing-statement/:documentNumber/add-processing-plant-details"],
        ]
      | [
          "/create-processing-statement/:documentNumber/add-your-reference",
          RouteParams["/create-processing-statement/:documentNumber/add-your-reference"],
        ]
      | [
          "/create-processing-statement/:documentNumber/catch-added",
          RouteParams["/create-processing-statement/:documentNumber/catch-added"],
        ]
      | [
          "/create-processing-statement/:documentNumber/check-your-information",
          RouteParams["/create-processing-statement/:documentNumber/check-your-information"],
        ]
      | [
          "/create-processing-statement/:documentNumber/copy-this-processing-statement",
          RouteParams["/create-processing-statement/:documentNumber/copy-this-processing-statement"],
        ]
      | [
          "/create-processing-statement/:documentNumber/copy-void-confirmation",
          RouteParams["/create-processing-statement/:documentNumber/copy-void-confirmation"],
        ]
      | [
          "/create-processing-statement/:documentNumber/delete-this-draft-processing-statement",
          RouteParams["/create-processing-statement/:documentNumber/delete-this-draft-processing-statement"],
        ]
      | [
          "/create-processing-statement/:documentNumber/processing-statement-created",
          RouteParams["/create-processing-statement/:documentNumber/processing-statement-created"],
        ]
      | [
          "/create-processing-statement/:documentNumber/progress",
          RouteParams["/create-processing-statement/:documentNumber/progress"],
        ]
      | [
          "/create-processing-statement/:documentNumber/void-this-processing-statement",
          RouteParams["/create-processing-statement/:documentNumber/void-this-processing-statement"],
        ]
      | [
          "/create-processing-statement/:documentNumber/what-export-destination",
          RouteParams["/create-processing-statement/:documentNumber/what-export-destination"],
        ]
      | [
          "/create-processing-statement/:documentNumber/what-exporters-address",
          RouteParams["/create-processing-statement/:documentNumber/what-exporters-address"],
        ]
      | [
          "/create-processing-statement/:documentNumber/what-processing-plant-address",
          RouteParams["/create-processing-statement/:documentNumber/what-processing-plant-address"],
        ]
      | ["/create-processing-statement/processing-statements"]
      | [
          "/create-storage-document/:documentNumber/add-exporter-details",
          RouteParams["/create-storage-document/:documentNumber/add-exporter-details"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-arrival-transportation-details-container-vessel",
          RouteParams["/create-storage-document/:documentNumber/add-arrival-transportation-details-container-vessel"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-arrival-transportation-details-plane",
          RouteParams["/create-storage-document/:documentNumber/add-arrival-transportation-details-plane"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-arrival-transportation-details-train",
          RouteParams["/create-storage-document/:documentNumber/add-arrival-transportation-details-train"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-arrival-transportation-details-truck",
          RouteParams["/create-storage-document/:documentNumber/add-arrival-transportation-details-truck"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-transportation-details-container-vessel",
          RouteParams["/create-storage-document/:documentNumber/add-transportation-details-container-vessel"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-transportation-details-plane",
          RouteParams["/create-storage-document/:documentNumber/add-transportation-details-plane"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-transportation-details-train",
          RouteParams["/create-storage-document/:documentNumber/add-transportation-details-train"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-transportation-details-truck",
          RouteParams["/create-storage-document/:documentNumber/add-transportation-details-truck"],
        ]
      | [
          "/create-storage-document/:documentNumber/add-your-reference",
          RouteParams["/create-storage-document/:documentNumber/add-your-reference"],
        ]
      | [
          "/create-storage-document/:documentNumber/check-your-information",
          RouteParams["/create-storage-document/:documentNumber/check-your-information"],
        ]
      | [
          "/create-storage-document/:documentNumber/copy-this-storage-document",
          RouteParams["/create-storage-document/:documentNumber/copy-this-storage-document"],
        ]
      | [
          "/create-storage-document/:documentNumber/copy-void-confirmation",
          RouteParams["/create-storage-document/:documentNumber/copy-void-confirmation"],
        ]
      | [
          "/create-storage-document/:documentNumber/delete-this-draft-storage-document",
          RouteParams["/create-storage-document/:documentNumber/delete-this-draft-storage-document"],
        ]
      | [
          "/create-storage-document/:documentNumber/do-you-have-a-road-transport-document",
          RouteParams["/create-storage-document/:documentNumber/do-you-have-a-road-transport-document"],
        ]
      | [
          "/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk",
          RouteParams["/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk"],
        ]
      | [
          "/create-storage-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk",
          RouteParams["/create-storage-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk"],
        ]
      | [
          "/create-storage-document/:documentNumber/progress",
          RouteParams["/create-storage-document/:documentNumber/progress"],
        ]
      | [
          "/create-storage-document/:documentNumber/storage-document-created",
          RouteParams["/create-storage-document/:documentNumber/storage-document-created"],
        ]
      | [
          "/create-storage-document/:documentNumber/void-this-storage-document",
          RouteParams["/create-storage-document/:documentNumber/void-this-storage-document"],
        ]
      | [
          "/create-storage-document/:documentNumber/what-exporters-address",
          RouteParams["/create-storage-document/:documentNumber/what-exporters-address"],
        ]
      | [
          "/create-storage-document/:documentNumber/you-have-added-a-product",
          RouteParams["/create-storage-document/:documentNumber/you-have-added-a-product"],
        ]
      | [
          "/create-storage-document/:documentNumber/you-have-added-a-storage-facility",
          RouteParams["/create-storage-document/:documentNumber/you-have-added-a-storage-facility"],
        ]
      | ["/create-storage-document/storage-documents"]
      | ["/dev/null"]
      | ["/forbidden/index"]
      | ["/get-commodity-codes"]
      | ["/get-gear-types"]
      | ["/get-species-state"]
      | ["/get-vessels"]
      | ["/health"]
      | ["/login/return"]
      | ["/logout"]
      | ["/manage-favourites"]
      | ["/privacy-notice"]
      | ["/service-improvement-plan"]
      | ["/sign-out"]
      | ["/there-is-a-problem-with-the-service"],
  >(...args: T): (typeof args)[0];
}
