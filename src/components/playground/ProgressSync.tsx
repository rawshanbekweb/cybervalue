"use client";

import { useEffect } from "react";
import {
  readStoredValue,
  watchStoredValue,
  writeStoredValue,
} from "./useLocalStorageState";
import {
  LAB_PROGRESS,
  lessonList,
  toRecord,
  type LabId,
} from "@/lib/lab-progress";

const ENDPOINT = "/student/api/progress";
// Whose account each lab's browser progress was last synced with.
const ownerKey = (key: string) => `${key}:owner`;

// Mirrors a lab's lesson progress to the signed-in student's account. On
// load the browser and the server copies are merged (a lesson finished on
// either device counts); after that every change is saved. Visitors who are
// not signed in keep browser-only progress, exactly as before. On a shared
// computer the progress of the previous student is replaced, not merged.
export function ProgressSync({ lab }: { lab: LabId }) {
  useEffect(() => {
    const { key, total } = LAB_PROGRESS[lab];
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stop = () => {};
    const local = () => lessonList(readStoredValue<unknown>(key, {}), total);
    const save = (lessons: number[]) =>
      fetch(ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lab, lessons }),
        keepalive: true,
      }).catch(() => {});

    fetch(`${ENDPOINT}?lab=${lab}`)
      .then((r) => (r.ok ? r.json() : { signedIn: false }))
      .then(
        (data: { signedIn: boolean; owner?: string; lessons?: number[] }) => {
          if (!active || !data.signedIn) return;
          const server = lessonList(data.lessons ?? [], total);
          const owner = readStoredValue<string>(ownerKey(key), "");
          const another = Boolean(owner && data.owner && owner !== data.owner);
          if (data.owner) writeStoredValue(ownerKey(key), data.owner);
          const mine = another ? [] : local();
          const merged = lessonList([...server, ...mine], total);
          if (another || merged.length !== mine.length)
            writeStoredValue(key, toRecord(merged));
          if (merged.length !== server.length) save(merged);
          stop = watchStoredValue(key, () => {
            clearTimeout(timer);
            timer = setTimeout(() => save(local()), 800);
          });
        },
      )
      .catch(() => {});
    return () => {
      active = false;
      clearTimeout(timer);
      stop();
    };
  }, [lab]);
  return null;
}
