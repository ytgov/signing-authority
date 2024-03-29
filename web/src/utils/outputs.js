import papa from "papaparse";

export function makeCSV(input) {
  return papa.unparse(input, { quotes: true });
}

export function saveCSVFile(data, filename) {
  const blob = new Blob([data], { type: "text/csv" });
  const e = document.createEvent("MouseEvents");
  const a = document.createElement("a");
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/csv", a.download, a.href].join(":");
  e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  a.dispatchEvent(e);
}
