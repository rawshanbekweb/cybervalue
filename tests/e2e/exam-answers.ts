// Prints the right option of every question of a domain exam, as the server
// rebuilds it from the attempt's seed: `tsx tests/e2e/exam-answers.ts <domain> <seed>`.
// Run as a separate process because Playwright can't load the JSON
// dictionaries the question builders import.
import { buildExam, examDomain } from "../../src/lib/domain-exam/build";

const [domain, seed] = process.argv.slice(2);
const exam = buildExam(examDomain(domain)!, Number(seed));
process.stdout.write(JSON.stringify(exam.map((q) => q.answer)));
