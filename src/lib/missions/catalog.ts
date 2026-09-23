import { fixture, type MissionId, type Policy } from "./engine";

export type Control = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};
export type Mission = {
  id: MissionId;
  number: string;
  title: string;
  client: string;
  difficulty: string;
  minutes: string;
  category: string;
  brief: string;
  objective: string;
  impact: string;
  initialPolicy: Policy;
  controls: Control[];
  hypotheses: string[];
  rootCause: number;
  hints: string[];
  debrief: string;
};
export const MISSIONS: Mission[] = [
  {
    id: "invoice",
    number: "01",
    title: "The invoice next door",
    client: "Northstar Billing",
    difficulty: "Investigator",
    minutes: "15–25 min",
    category: "Access control",
    brief:
      "A customer reports seeing another company’s invoice after editing a bookmark. Support says both customers were signed in, so authentication must be working. You have two test accounts and a copy of the invoice service. Find the missing boundary without breaking legitimate access.",
    objective:
      "Establish a normal request, reproduce a cross-account leak, then protect both the detail and collection endpoints.",
    impact: "Customer names and invoice totals cross account boundaries.",
    initialPolicy: { detail: "signed-in", list: "all", shutdown: "off" },
    controls: [
      {
        key: "detail",
        label: "Invoice detail policy",
        options: [
          { value: "signed-in", label: "Any signed-in user" },
          { value: "owner", label: "Authenticated owner only" },
        ],
      },
      {
        key: "list",
        label: "Collection query scope",
        options: [
          { value: "all", label: "All customer invoices" },
          { value: "owner", label: "Filter by authenticated owner" },
        ],
      },
    ],
    hypotheses: [
      "Sequential IDs are the only problem; random IDs fix access control.",
      "Authentication is being treated as permission to access every resource.",
      "The browser needs to hide the invoice URL.",
    ],
    rootCause: 1,
    hints: [
      "Compare an owner’s normal request with the same request made by the other account.",
      "The resource ID selects a record. Which check connects that record to the authenticated account?",
      "Protecting /invoices/:id is not enough. Inspect GET /invoices and scope both paths to the owner.",
    ],
    debrief:
      "Authentication establishes identity. Authorization must constrain every data access, including collection queries. Unpredictable IDs can reduce guessing but do not replace permission checks. In a real service, centralize the policy and test every data path.",
  },
  {
    id: "checkout",
    number: "02",
    title: "The one-cent order",
    client: "Field Supply",
    difficulty: "Problem solver",
    minutes: "20–30 min",
    category: "Business logic",
    brief:
      "The storefront displays the correct price, but finance found orders whose totals do not match the catalog. The checkout accepts a cart assembled by the browser. Investigate price, quantities, and coupon interactions; a fix that stops real customers from buying is not a fix.",
    objective:
      "Create a legitimate order, produce an invalid charge, and restore server-owned pricing while keeping valid discounts and bulk orders working.",
    impact: "A trusted-looking cart can produce underpriced or invalid orders.",
    initialPolicy: {
      price: "client",
      quantity: "unchecked",
      coupon: "repeat",
      shutdown: "off",
    },
    controls: [
      {
        key: "price",
        label: "Source of unit price",
        options: [
          { value: "client", label: "Price submitted in the cart" },
          { value: "catalog", label: "Look up price in the catalog" },
        ],
      },
      {
        key: "quantity",
        label: "Quantity validation",
        options: [
          { value: "unchecked", label: "Accept any numeric quantity" },
          { value: "bounded", label: "Integer quantity between 1 and 5" },
        ],
      },
      {
        key: "coupon",
        label: "Coupon application",
        options: [
          { value: "repeat", label: "Apply every matching coupon" },
          { value: "once", label: "Apply WELCOME10 once per order" },
        ],
      },
    ],
    hypotheses: [
      "Client-controlled fields are being trusted as business rules.",
      "HTTPS would prevent a customer changing their own cart.",
      "Only negative prices matter; quantities and coupons are safe.",
    ],
    rootCause: 0,
    hints: [
      "Read /catalog, then compare its unitPrice with the JSON sent to /checkout.",
      "Change one field at a time. Try a lower price, a negative quantity, and a repeated coupon.",
      "The complete fix uses the catalog price, validates integer quantities, and prevents repeated application of the same coupon.",
    ],
    debrief:
      "The browser expresses intent, not authority. Derive prices from trusted catalog data, validate quantities against inventory rules, and enforce discount policy independently. Monetary calculations here use integer cents; production systems also need transactional inventory and currency-specific rounding.",
  },
  {
    id: "webhook",
    number: "03",
    title: "Delivered twice",
    client: "Parcel Loop",
    difficulty: "Systems thinker",
    minutes: "25–35 min",
    category: "Event integrity",
    brief:
      "One payment, two parcels. The payment provider retries notifications when a connection drops. Operations also found an event with an invalid signature. Repair the event handler so trusted retries are harmless and forged events never reach fulfillment.",
    objective:
      "Observe a valid delivery, demonstrate a replay or forgery, and make verification plus deduplication survive changed retry metadata.",
    impact:
      "Duplicate or forged payment notifications create unauthorized deliveries.",
    initialPolicy: { signature: "skip", replay: "none", shutdown: "off" },
    controls: [
      {
        key: "signature",
        label: "Provider verification",
        options: [
          { value: "skip", label: "Trust the notification" },
          { value: "verify", label: "Verify before processing" },
        ],
      },
      {
        key: "replay",
        label: "Deduplication strategy",
        options: [
          { value: "none", label: "Process every notification" },
          { value: "body", label: "Compare the entire request body" },
          { value: "event", label: "Use the stable provider event ID" },
        ],
      },
    ],
    hypotheses: [
      "Retries should be disabled at the provider.",
      "Comparing whole JSON bodies is always sufficient.",
      "The handler needs verified origin and stable event-based idempotency.",
    ],
    rootCause: 2,
    hints: [
      "Send the initial request twice. Watch the deliveries counter, not just the 200 status.",
      "Try a retry with the same eventId but attempt: 2. A new JSON body does not mean a new payment.",
      "Verify the signature before checking for duplicate IDs, then acknowledge retries without creating another delivery.",
    ],
    debrief:
      "Authenticate the event before trusting its identifier. Deduplicate on a stable provider event ID, not a mutable payload. In production, signature verification uses the provider’s algorithm and raw body; an atomic unique constraint and transaction must connect event recording to fulfillment. This simulation models sequential delivery, not concurrency.",
  },
];

export function missionFiles(id: MissionId, variant: number) {
  const f = fixture(variant);
  if (id === "invoice")
    return [
      {
        name: "support-ticket.txt",
        text: `Alex owns invoice ${f.own}. Sam owns invoice ${f.other}.\nBoth accounts have the customer role. Anonymous users must not access invoices.\nApproved routes: GET /invoices and GET /invoices/:id.`,
      },
      {
        name: "handler.pseudocode",
        text: "user = requireSignedIn(request)\nif collection: return invoices.findMany()\nreturn invoices.findById(request.id)\n\n// Which query needs an ownership constraint?",
      },
      {
        name: "acceptance-criteria.md",
        text: "Owners can read their own invoices.\nOther customers cannot read them.\nLists contain only the caller’s records.\nMissing records return 404; guests receive 401.",
      },
    ];
  if (id === "checkout")
    return [
      {
        name: "catalog.json",
        text: JSON.stringify(
          {
            sku: "FIELD-KIT",
            unitPrice: f.price,
            currency: "USD cents",
            quantityRange: "integer 1–5",
            coupon: "WELCOME10: 10%, once",
          },
          null,
          2,
        ),
      },
      {
        name: "checkout.pseudocode",
        text: "price = request.body.unitPrice\nquantity = request.body.quantity\ndiscount = matchingCoupons.length * 0.10\ntotal = round(price * quantity * (1 - discount))\ncreateOrder(total)",
      },
      {
        name: "acceptance-criteria.md",
        text: "GET /catalog returns trusted product data.\nPOST /checkout requires a signed-in customer.\nThe catalog owns the price. Quantity must be an integer from 1 to 5.\nWELCOME10 discounts a purchase once. Valid bulk orders still work.",
      },
    ];
  return [
    {
      name: "incident-timeline.log",
      text: `09:12:00 payment.succeeded ${f.event} → delivery queued\n09:12:02 response connection lost\n09:12:10 provider retry ${f.event}, attempt=2 → delivery queued again\n09:13:00 unverified notification → delivery queued`,
    },
    {
      name: "provider-contract.md",
      text: `POST /webhooks/payment\nKnown order: ${f.order}\nStable event ID: ${f.event}\nProvider retries may change attempt metadata.\nFor this simulation only, signature="provider-valid" means the verifier accepts the event. Any other value is invalid. No cryptography is performed.`,
    },
    {
      name: "acceptance-criteria.md",
      text: "Valid payment: one delivery. Repeated event: 200 acknowledgement, no new delivery.\nInvalid signatures: 401, even for a previously seen ID.\nUnrelated events: 202, no delivery. Unknown order: 404.\nDeduplication persists within the current sandbox until reset.",
    },
  ];
}
