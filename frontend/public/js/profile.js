document.addEventListener('DOMContentLoaded', () => {
    const progressBars = document.querySelectorAll('.progress-bar');
  
    progressBars.forEach(bar => {
      const score = bar.getAttribute('data-score');
      const level = bar.getAttribute('data-level');
      const progress = bar.querySelector('.progress');
  
      let width;
      if (level == 4) {
        width = 100; 
      } else {
        width = score % 100; 
      }
  
      progress.style.width = `${width}%`;
    });
  });
  