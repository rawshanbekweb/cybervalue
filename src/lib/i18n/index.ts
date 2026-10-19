import {
  buildDictionaries,
  translatorFor,
  type Locale,
  type Translator,
} from "./core";
import common from "./messages.json";
import html from "./html.json";
import ctf from "./ctf.json";
import exam from "./exam.json";
import studio from "./studio.json";
import missions from "./missions.json";
import lab from "./lab.json";
import assessment from "./assessment.json";
import resourceExam from "./resource-exam.json";
import admin from "./admin.json";
import linux from "./linux.json";
import network from "./network.json";
import student from "./student.json";
import junior from "./junior.json";
import kids from "./kids.json";
import defend from "./defend.json";
import labsUi from "./labs-ui.json";

export const allMessages = [
  common,
  html,
  ctf,
  exam,
  studio,
  missions,
  lab,
  assessment,
  resourceExam,
  admin,
  linux,
  network,
  student,
  junior,
  kids,
  defend,
  labsUi,
];

export * from "./core";

const dictionaries = buildDictionaries(allMessages);

export function createTranslator(locale: Locale): Translator {
  return translatorFor(dictionaries, locale);
}

/** Whether any dictionary knows this text (in either language). */
export function hasMessage(source: string) {
  return dictionaries.en.has(source);
}
