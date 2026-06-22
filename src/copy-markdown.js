window.copyMarkdown = async function(button) {
  const originalContent = button?.innerHTML;
  const pageID = new URLSearchParams(window.location.search).get("page") || "index";
  const contentResponse = await fetch(`page-data/${pageID}.md`);
  const passageMarkdown = await contentResponse.text();

  clipboard.copy(passageMarkdown);

  if (button) {
    button.innerHTML = '<span class="material-icons">check</span>&ensp;已复制';
    setTimeout(() => {
      button.innerHTML = originalContent;
    }, 1000);
  }
};

// Floating buttons functionality
document.addEventListener('DOMContentLoaded', () => {
  // Copy Markdown button
  const copyMdButton = document.getElementById('copy-md-button');
  if (copyMdButton) {
    copyMdButton.addEventListener('click', async () => {
      const iconElement = copyMdButton.querySelector('i');
      const originalIcon = iconElement.className;
      
      // Copy markdown content
      const pageID = new URLSearchParams(window.location.search).get("page") || "index";
      try {
        const contentResponse = await fetch(`page-data/${pageID}.md`);
        const passageMarkdown = await contentResponse.text();
        clipboard.copy(passageMarkdown);
        
        // Change icon to check
        iconElement.className = 'clipboard-check';
        
        // Revert after 1 second
        setTimeout(() => {
          iconElement.className = originalIcon;
        }, 1000);
      } catch (error) {
        console.error('Failed to copy markdown:', error);
      }
    });
  }

  // Back to top button
  const backToTopButton = document.getElementById('back-to-top-button');
  if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
