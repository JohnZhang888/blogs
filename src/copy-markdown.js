window.copyMarkdown = async function(button) {
  const originalContent = button?.innerHTML;
  const pageID = new URLSearchParams(window.location.search).get("page") || "index";
  const contentResponse = await fetch(`page-data/${pageID}.md`);
  const passageMarkdown = await contentResponse.text();

  clipboard.copy(passageMarkdown);

  if (button) {
    button.innerHTML = '<i class="bi bi-check2"></i>&ensp;已复制';
    setTimeout(() => {
      button.innerHTML = originalContent;
    }, 1000);
  }
};