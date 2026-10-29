// Academy Intermediate · Threat hunting: mark a threat report's techniques
// on a slice of the MITRE ATT&CK matrix, then stack scheduled tasks across
// forty computers to find the one that doesn't belong. Simplified, but the
// tactic and technique IDs are ATT&CK's own.

// --- The matrix ------------------------------------------------------------------------

export type Technique = { id: string; name: string };
export type Tactic = { id: string; name: string; techniques: Technique[] };

export const MATRIX: Tactic[] = [
  {
    id: "TA0001",
    name: "Initial Access",
    techniques: [
      { id: "T1566.001", name: "Spearphishing Attachment" },
      { id: "T1190", name: "Exploit Public-Facing Application" },
      { id: "T1078", name: "Valid Accounts" },
    ],
  },
  {
    id: "TA0002",
    name: "Execution",
    techniques: [
      { id: "T1059.001", name: "PowerShell" },
      { id: "T1204.002", name: "Malicious File" },
    ],
  },
  {
    id: "TA0003",
    name: "Persistence",
    techniques: [
      { id: "T1053.005", name: "Scheduled Task" },
      { id: "T1547.001", name: "Registry Run Keys" },
      { id: "T1136", name: "Create Account" },
    ],
  },
  {
    id: "TA0006",
    name: "Credential Access",
    techniques: [
      { id: "T1003.001", name: "LSASS Memory" },
      { id: "T1110.003", name: "Password Spraying" },
    ],
  },
  {
    id: "TA0008",
    name: "Lateral Movement",
    techniques: [
      { id: "T1021.001", name: "Remote Desktop Protocol" },
      { id: "T1021.002", name: "SMB/Windows Admin Shares" },
    ],
  },
  {
    id: "TA0010",
    name: "Exfiltration",
    techniques: [
      { id: "T1567.002", name: "Exfiltration to Cloud Storage" },
      { id: "T1048", name: "Exfiltration Over Alternative Protocol" },
    ],
  },
];

/** What the threat report says the group does, in ATT&CK terms. */
export const REPORT = ["T1566.001", "T1053.005", "T1021.001", "T1567.002"];

export const layerRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === REPORT.length && REPORT.every((id) => set.has(id));
};

// --- Stacking --------------------------------------------------------------------------

export type Task = {
  name: string;
  command: string;
  /** How many of the forty computers have it. */
  hosts: number;
};

export const HOST_COUNT = 40;

export const TASKS: Task[] = [
  {
    name: "GoogleUpdateTaskMachineUA",
    command: "C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe /ua",
    hosts: 40,
  },
  {
    name: "OneDrive Standalone Update Task",
    command:
      "C:\\Users\\<user>\\AppData\\Local\\Microsoft\\OneDrive\\OneDriveStandaloneUpdater.exe",
    hosts: 38,
  },
  {
    name: "Adobe Acrobat Update Task",
    command:
      "C:\\Program Files (x86)\\Common Files\\Adobe\\ARM\\1.0\\AdobeARM.exe",
    hosts: 22,
  },
  {
    name: "MicrosoftEdgeUpdateTaskMachineCore",
    command:
      "C:\\Program Files (x86)\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe /c",
    hosts: 40,
  },
  {
    name: "WindowsUpdateCheck",
    command: "C:\\Users\\Public\\svchost.exe -k netsvc",
    hosts: 1,
  },
  {
    name: "Zoom Updater",
    command: "C:\\Program Files\\Zoom\\bin\\ZoomUpdater.exe",
    hosts: 9,
  },
];

export const OUTLIER = "WindowsUpdateCheck";
export const OUTLIER_HOST = "FIN-PC-12";

/** Rarest first, the way stacking puts it. */
export const stacked = () =>
  [...TASKS].sort((a, b) => a.hosts - b.hosts || a.name.localeCompare(b.name));

export const stackRight = (name: string | null) => name === OUTLIER;
