// Academy Intermediate · IAM: a small AWS-style policy evaluator — default
// deny, Allow statements with * wildcards, and an explicit Deny that always
// wins — used on six requests from a reporting user. The account and
// bucket names are invented.

export type Statement = {
  effect: "Allow" | "Deny";
  action: string;
  resource: string;
};

/** The policy attached to the user `reporter`. */
export const POLICY: Statement[] = [
  {
    effect: "Allow",
    action: "s3:GetObject",
    resource: "arn:aws:s3:::acme-reports/*",
  },
  {
    effect: "Allow",
    action: "s3:ListBucket",
    resource: "arn:aws:s3:::acme-reports",
  },
  {
    effect: "Deny",
    action: "s3:*",
    resource: "arn:aws:s3:::acme-reports/salaries/*",
  },
];

const glob = (pattern: string, value: string) =>
  new RegExp(
    "^" +
      pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
      "$",
  ).test(value);

export type Decision = "allow" | "implicit" | "explicit";

/** Explicit deny beats any allow; with no matching allow, the default is deny. */
export function evaluate(
  policy: Statement[],
  action: string,
  resource: string,
): Decision {
  const hits = policy.filter(
    (s) => glob(s.action, action) && glob(s.resource, resource),
  );
  if (hits.some((s) => s.effect === "Deny")) return "explicit";
  if (hits.some((s) => s.effect === "Allow")) return "allow";
  return "implicit";
}

export type Request = { action: string; resource: string };

export const REQUESTS: Request[] = [
  { action: "s3:GetObject", resource: "arn:aws:s3:::acme-reports/2026/q3.pdf" },
  {
    action: "s3:GetObject",
    resource: "arn:aws:s3:::acme-reports/salaries/oct.xlsx",
  },
  { action: "s3:PutObject", resource: "arn:aws:s3:::acme-reports/2026/q3.pdf" },
  { action: "s3:ListBucket", resource: "arn:aws:s3:::acme-reports" },
  { action: "s3:DeleteBucket", resource: "arn:aws:s3:::acme-reports" },
  {
    action: "ec2:StartInstances",
    resource: "arn:aws:ec2:eu-central-1:111122223333:instance/i-0abc",
  },
];

export type Calls = Partial<Record<number, boolean>>;

/** true = the student says the request is allowed. */
export const policyRight = (calls: Calls) =>
  REQUESTS.every(
    (r, i) => calls[i] === (evaluate(POLICY, r.action, r.resource) === "allow"),
  );
