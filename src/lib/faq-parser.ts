export type ParsedFaq = { question: string; answer: string };

// Strips the markdown emphasis, heading and bullet noise that survives a copy
// out of a chat answer or a doc, so the marker checks below see the bare text.
function stripMarkup(line: string) {
  return line
    .replace(/^[#>\s]*/, "")
    .replace(/^[-*+•]\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/^__|__$/g, "")
    .trim();
}

const QUESTION_MARKER = /^(?:q(?:ue|uestion)?)\s*[.):\-]\s*/i;
const ANSWER_MARKER = /^(?:a(?:ns|nswer)?)\s*[.):\-]\s*/i;
const NUMBER_MARKER = /^\d{1,3}\s*[.)\]]\s+/;

/**
 * Turns a pasted FAQ list into question/answer pairs. Three shapes:
 *   1. Marker prefixes: "Q." / "Que:" / "Question:" with "A." / "Ans:" / "Answer:"
 *   2. Numbered lists: "1. Question" with the answer on the lines below
 *   3. Bare pairs: a line ending in "?" followed by its answer paragraph
 */
export function parseFaqText(text: string): ParsedFaq[] {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(stripMarkup)
    .filter(Boolean);

  const hasMarkers = lines.some((line) => QUESTION_MARKER.test(line) || ANSWER_MARKER.test(line));
  const pairs: ParsedFaq[] = [];
  let question = "";
  let answer = "";
  // Numbered questions run 1, 2, 3...; any other number is a list inside an answer.
  let expectedNumber = 1;

  const flush = () => {
    if (question.trim()) pairs.push({ question: question.trim(), answer: answer.trim() });
    question = "";
    answer = "";
  };

  for (const line of lines) {
    if (QUESTION_MARKER.test(line)) {
      flush();
      question = line.replace(QUESTION_MARKER, "").replace(NUMBER_MARKER, "");
      continue;
    }
    if (ANSWER_MARKER.test(line)) {
      answer = line.replace(ANSWER_MARKER, "");
      continue;
    }
    const numbered = line.match(NUMBER_MARKER);
    if (numbered && Number.parseInt(numbered[0], 10) === expectedNumber) {
      flush();
      question = line.replace(NUMBER_MARKER, "");
      expectedNumber += 1;
      continue;
    }
    // A short line ending in "?" starts a new pair, but only once the current
    // pair has its answer, so a rhetorical question in an answer doesn't split it.
    if (!hasMarkers && line.endsWith("?") && line.length <= 200 && (!question || answer)) {
      flush();
      question = line;
      continue;
    }
    if (!question) {
      question = line;
      continue;
    }
    answer = answer ? `${answer}\n${line}` : line;
  }

  flush();
  return pairs.filter((pair) => pair.question && pair.answer);
}

/** Cells copied from a table: tab-separated, one row per line. */
export function parseFaqTable(text: string): ParsedFaq[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const [question = "", answer = ""] = line.split("\t");
      return { question: question.trim(), answer: answer.trim() };
    });
}

export const faqPasteStyles = [
  { label: "Que. / Ans.", hint: "also Q. / A., Q: / A:, Question: / Answer:" },
  { label: "1. 2. 3.", hint: "numbered questions, with the answer on the lines below each one" },
  { label: "Plain", hint: "a question line ending in “?”, then its answer paragraph" },
  { label: "Table", hint: "copy question and answer columns from a doc or sheet" },
];
