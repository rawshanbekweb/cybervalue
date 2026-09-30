import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const file='src/components/playground/security-lab/SecurityLab.tsx';
let text=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'});
text=text.replace('import { useHashLessonId } from "../useHashLessonId";', 'import { useHashLessonId } from "../useHashLessonId";\nimport { lessonRecord } from "@/lib/learning-progress";');
text=text.replace('  const [completed, setCompletedStored] = useLocalStorageState<Record<number, boolean>>(PROGRESS_KEY, {});\n  const [notes, setNotesStored] = useLocalStorageState<Record<number, string>>(NOTES_KEY, {});', '  const [storedProgress, setCompletedStored] = useLocalStorageState<unknown>(PROGRESS_KEY, {});\n  const [storedNotes, setNotesStored] = useLocalStorageState<unknown>(NOTES_KEY, {});\n  const completed = lessonRecord<boolean>(storedProgress, TOTAL, "boolean");\n  const notes = lessonRecord<string>(storedNotes, TOTAL, "string");');
text=text.replace('const doneCount = Object.keys(completed).length;', 'const doneCount = Object.values(completed).filter((value) => value === true).length;');
fs.writeFileSync(file,text);
