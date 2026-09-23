export type MissionId = "invoice" | "checkout" | "webhook";
export type Actor = "alex" | "sam" | "anonymous";
export type Policy = Record<string, string>;
export type LabRequest = {
  method: "GET" | "POST";
  path: string;
  actor: Actor;
  body: string;
};
export type Sandbox = {
  deliveries: number;
  seenEvents: string[];
  seenBodies: string[];
};
export type Outcome = {
  status: number;
  data: Record<string, unknown>;
  trace: string[];
  state: Sandbox;
  evidence: "baseline" | "exploit" | "defense" | null;
};
export type Regression = {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
};

export const freshSandbox = (): Sandbox => ({
  deliveries: 0,
  seenEvents: [],
  seenBodies: [],
});
export function fixture(variant: number) {
  return {
    own: 4100 + variant * 10 + 1,
    other: 4100 + variant * 10 + 2,
    price: 4900 + variant * 1000,
    event: `evt_${variant}_paid`,
    order: `order_${variant}_42`,
  };
}

export function simulate(
  id: MissionId,
  variant: number,
  policy: Policy,
  request: LabRequest,
  previous = freshSandbox(),
): Outcome {
  const f = fixture(variant);
  const state = {
    ...previous,
    seenEvents: [...previous.seenEvents],
    seenBodies: [...previous.seenBodies],
  };
  const trace = [
    `${request.method} ${request.path}`,
    `Identity: ${request.actor}`,
  ];
  const respond = (
    status: number,
    data: Record<string, unknown>,
    evidence: Outcome["evidence"] = null,
  ): Outcome => ({ status, data, trace, state, evidence });
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(request.path) || request.path.length > 160)
    return respond(400, {
      error:
        "Use a sandbox path from the mission brief. External URLs and query strings are not supported.",
    });
  if (policy.shutdown === "on") {
    trace.push("Emergency block: all traffic denied.");
    return respond(503, { error: "Service unavailable" });
  }
  let body: Record<string, unknown> = {};
  if (request.method === "POST") {
    if (request.body.length > 4000)
      return respond(413, { error: "Request body exceeds 4,000 characters." });
    try {
      const parsed: unknown = JSON.parse(request.body);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error();
      body = parsed as Record<string, unknown>;
    } catch {
      return respond(400, { error: "Body must be a JSON object." });
    }
  }

  if (id === "invoice") {
    if (request.method !== "GET")
      return respond(405, { error: "Invoices are read-only. Use GET." });
    const invoices = [
      { id: f.own, owner: "alex", total: 12900, customer: "North Studio" },
      { id: f.other, owner: "sam", total: 87000, customer: "Harbor Design" },
    ];
    if (request.path !== "/invoices" && !/^\/invoices\/\d+$/.test(request.path))
      return respond(404, { error: "No such route" });
    if (request.actor === "anonymous") {
      trace.push("Authentication rejected: no identity.");
      return respond(401, { error: "Sign in first" });
    }
    trace.push(
      "Authentication passed. Does this identity own the requested data?",
    );
    if (request.path === "/invoices") {
      const rows =
        policy.list === "owner"
          ? invoices.filter((invoice) => invoice.owner === request.actor)
          : invoices;
      trace.push(
        policy.list === "owner"
          ? "Collection filtered by authenticated owner."
          : "Collection query has no owner filter.",
      );
      return respond(
        200,
        { invoices: rows },
        rows.some((row) => row.owner !== request.actor) ? "exploit" : "defense",
      );
    }
    const invoice = invoices.find(
      (row) => row.id === Number(request.path.split("/").at(-1)),
    );
    if (!invoice) return respond(404, { error: "Invoice not found" });
    if (policy.detail === "owner" && invoice.owner !== request.actor) {
      trace.push("Ownership check rejected a cross-account request.");
      return respond(
        403,
        { error: "This invoice belongs to another account" },
        "defense",
      );
    }
    trace.push(
      policy.detail === "owner"
        ? "Owner matches: access granted."
        : "Resource ID accepted without an ownership check.",
    );
    return respond(
      200,
      { invoice },
      invoice.owner === request.actor ? "baseline" : "exploit",
    );
  }

  if (id === "checkout") {
    if (request.path === "/catalog" && request.method === "GET")
      return respond(200, {
        sku: "FIELD-KIT",
        unitPrice: f.price,
        currency: "USD cents",
        coupon: "WELCOME10",
        maxQuantity: 5,
      });
    if (request.path !== "/checkout")
      return respond(404, { error: "No such route" });
    if (request.method !== "POST") return respond(405, { error: "Use POST" });
    if (request.actor === "anonymous")
      return respond(401, { error: "Sign in first" });
    if (body.sku !== "FIELD-KIT")
      return respond(404, { error: "Unknown product" });
    const quantity = body.quantity;
    if (typeof quantity !== "number" || !Number.isFinite(quantity))
      return respond(400, { error: "quantity must be a number" });
    if (
      policy.quantity === "bounded" &&
      (!Number.isInteger(quantity) || quantity < 1 || quantity > 5)
    ) {
      trace.push("Quantity rejected: integer range 1–5 required.");
      return respond(
        422,
        { error: "Quantity must be an integer from 1 to 5" },
        "defense",
      );
    }
    const supplied = body.unitPrice;
    const price = policy.price === "catalog" ? f.price : supplied;
    if (typeof price !== "number" || !Number.isFinite(price))
      return respond(400, {
        error: "unitPrice must be a number when client pricing is enabled",
      });
    trace.push(
      policy.price === "catalog"
        ? `Price loaded from catalog: ${f.price} cents.`
        : `Price trusted from request body: ${price} cents.`,
    );
    if (
      !Array.isArray(body.coupons) ||
      body.coupons.length > 10 ||
      body.coupons.some((coupon) => typeof coupon !== "string")
    )
      return respond(400, {
        error: "coupons must be an array of at most 10 strings",
      });
    const count = body.coupons.filter(
      (coupon) => coupon === "WELCOME10",
    ).length;
    const discounts = policy.coupon === "once" ? Math.min(count, 1) : count;
    const total = Math.round(price * quantity * (1 - discounts * 0.1));
    trace.push(`Coupon applied ${discounts} time(s). Total: ${total} cents.`);
    const invalidQuantity =
      !Number.isInteger(quantity) || quantity < 1 || quantity > 5;
    const canonical = Math.round(f.price * quantity * (count > 0 ? 0.9 : 1));
    const attacked = supplied !== f.price || count > 1 || invalidQuantity;
    return respond(
      201,
      { order: f.order, total, quantity, discounts, currency: "USD cents" },
      invalidQuantity || total !== canonical
        ? "exploit"
        : attacked
          ? "defense"
          : "baseline",
    );
  }

  if (request.path !== "/webhooks/payment")
    return respond(404, { error: "No such route" });
  if (request.method !== "POST") return respond(405, { error: "Use POST" });
  if (
    typeof body.eventId !== "string" ||
    body.eventId.length > 80 ||
    typeof body.orderId !== "string"
  )
    return respond(400, { error: "eventId and orderId are required strings" });
  if (policy.signature === "verify" && body.signature !== "provider-valid") {
    trace.push("Provider signature verification failed (simulated verifier).");
    return respond(401, { error: "Invalid provider signature" }, "defense");
  }
  trace.push(
    policy.signature === "verify"
      ? "Provider signature verified by the simulated verifier."
      : "Provider signature was not checked.",
  );
  if (body.orderId !== f.order) return respond(404, { error: "Unknown order" });
  if (body.type !== "payment.succeeded")
    return respond(202, { ignored: true, deliveries: state.deliveries });
  const fingerprint = JSON.stringify(body);
  const seen =
    policy.replay === "event"
      ? state.seenEvents.includes(body.eventId)
      : policy.replay === "body"
        ? state.seenBodies.includes(fingerprint)
        : false;
  if (seen) {
    trace.push("Duplicate event acknowledged; fulfillment skipped.");
    return respond(
      200,
      { duplicate: true, deliveries: state.deliveries },
      "defense",
    );
  }
  const wasReplay = state.seenEvents.includes(body.eventId);
  if (state.seenEvents.length >= 50)
    return respond(429, {
      error: "Case capacity reached. Reset the sandbox to continue.",
    });
  state.seenEvents.push(body.eventId);
  state.seenBodies.push(fingerprint);
  state.deliveries += 1;
  trace.push(`Fulfillment queued. Deliveries created: ${state.deliveries}.`);
  return respond(
    200,
    { accepted: true, deliveries: state.deliveries },
    body.signature !== "provider-valid" || wasReplay ? "exploit" : "baseline",
  );
}

export function initialRequest(id: MissionId, variant: number): LabRequest {
  const f = fixture(variant);
  return {
    method: id === "invoice" ? "GET" : "POST",
    actor: "alex",
    path:
      id === "invoice"
        ? `/invoices/${f.own}`
        : id === "checkout"
          ? "/checkout"
          : "/webhooks/payment",
    body: JSON.stringify(
      id === "checkout"
        ? { sku: "FIELD-KIT", quantity: 1, unitPrice: f.price, coupons: [] }
        : id === "webhook"
          ? {
              eventId: f.event,
              orderId: f.order,
              type: "payment.succeeded",
              signature: "provider-valid",
              attempt: 1,
            }
          : {},
      null,
      2,
    ),
  };
}

export function regressions(
  id: MissionId,
  variant: number,
  policy: Policy,
): Regression[] {
  const f = fixture(variant);
  const base = initialRequest(id, variant);
  const output: Regression[] = [];
  const run = (
    name: string,
    request: LabRequest,
    expected: string,
    check: (outcome: Outcome) => boolean,
    previous?: Sandbox,
  ) => {
    const result = simulate(id, variant, policy, request, previous);
    output.push({
      name,
      passed: check(result),
      expected,
      actual: `${result.status} · ${JSON.stringify(result.data)}`,
    });
    return result;
  };
  const withBody = (body: Record<string, unknown>) => ({
    ...base,
    body: JSON.stringify({ ...JSON.parse(base.body), ...body }),
  });
  if (id === "invoice") {
    run(
      "Owner can read their invoice",
      base,
      "200 with Alex’s invoice",
      (r) => r.status === 200 && r.evidence === "baseline",
    );
    run(
      "Cross-account detail is denied",
      { ...base, path: `/invoices/${f.other}` },
      "403",
      (r) => r.status === 403,
    );
    run(
      "Collection does not leak another owner",
      { ...base, path: "/invoices" },
      "200 with only Alex’s invoice",
      (r) =>
        r.status === 200 &&
        JSON.stringify(r.data) ===
          JSON.stringify({
            invoices: [
              {
                id: f.own,
                owner: "alex",
                total: 12900,
                customer: "North Studio",
              },
            ],
          }),
    );
    run(
      "Second owner still has access",
      { ...base, actor: "sam", path: `/invoices/${f.other}` },
      "200 with Sam’s invoice",
      (r) => r.status === 200 && r.evidence === "baseline",
    );
    run(
      "Anonymous access is rejected",
      { ...base, actor: "anonymous" },
      "401",
      (r) => r.status === 401,
    );
    run(
      "Missing resource remains a 404",
      { ...base, path: "/invoices/99999" },
      "404",
      (r) => r.status === 404,
    );
  } else if (id === "checkout") {
    run(
      "Normal purchase succeeds",
      base,
      `201, total ${f.price}`,
      (r) => r.status === 201 && r.data.total === f.price,
    );
    run(
      "Client price cannot change the charge",
      withBody({ unitPrice: 1 }),
      `201, total ${f.price}`,
      (r) => r.status === 201 && r.data.total === f.price,
    );
    run(
      "Duplicate coupons only discount once",
      withBody({ coupons: ["WELCOME10", "WELCOME10"] }),
      `201, total ${Math.round(f.price * 0.9)}`,
      (r) => r.status === 201 && r.data.total === Math.round(f.price * 0.9),
    );
    run(
      "Negative quantity is rejected",
      withBody({ quantity: -2 }),
      "422",
      (r) => r.status === 422,
    );
    run(
      "Fractional quantity is rejected",
      withBody({ quantity: 1.5 }),
      "422",
      (r) => r.status === 422,
    );
    run(
      "Inventory limit is enforced",
      withBody({ quantity: 6 }),
      "422",
      (r) => r.status === 422,
    );
    run(
      "Valid bulk order and coupon work",
      withBody({ quantity: 3, coupons: ["WELCOME10"] }),
      `201, total ${Math.round(f.price * 3 * 0.9)}`,
      (r) => r.status === 201 && r.data.total === Math.round(f.price * 3 * 0.9),
    );
    run(
      "Anonymous checkout is rejected",
      { ...base, actor: "anonymous" },
      "401",
      (r) => r.status === 401,
    );
  } else {
    const first = run(
      "Valid payment creates one delivery",
      base,
      "200, deliveries 1",
      (r) => r.status === 200 && r.data.deliveries === 1,
    );
    run(
      "Exact retry does not deliver twice",
      base,
      "200, deliveries 1, duplicate true",
      (r) =>
        r.status === 200 &&
        r.data.deliveries === 1 &&
        r.data.duplicate === true,
      first.state,
    );
    run(
      "Retry with changed metadata is still a duplicate",
      withBody({ attempt: 2 }),
      "200, deliveries 1, duplicate true",
      (r) =>
        r.status === 200 &&
        r.data.deliveries === 1 &&
        r.data.duplicate === true,
      first.state,
    );
    run(
      "Forged signature is rejected",
      withBody({ signature: "forged" }),
      "401, zero deliveries",
      (r) => r.status === 401 && r.state.deliveries === 0,
    );
    run(
      "Unsigned retry cannot bypass verification",
      withBody({ signature: "forged" }),
      "401",
      (r) => r.status === 401,
      first.state,
    );
    run(
      "Unrelated event does not trigger fulfillment",
      withBody({ type: "payment.pending" }),
      "202, zero deliveries",
      (r) => r.status === 202 && r.state.deliveries === 0,
    );
    run(
      "Unknown order is not fulfilled",
      withBody({ orderId: "missing" }),
      "404, zero deliveries",
      (r) => r.status === 404 && r.state.deliveries === 0,
    );
  }
  return output;
}
