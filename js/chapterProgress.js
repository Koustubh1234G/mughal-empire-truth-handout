// Track and prompt last read chapter
const chapter = localStorage.getItem("lastReadChapter");
if (chapter) {
  if (confirm(`Continue from Chapter ${chapter}?`)) {
    location.href = `#chapter-${chapter}`;
  }
}
function markChapter(ch) {
  localStorage.setItem("lastReadChapter", ch);
}