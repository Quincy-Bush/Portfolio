
          window.onscroll = function() {myFunction()};
          window.addEventListener('DOMContentLoaded', adjustFlipCardHeights);
          window.addEventListener('resize', adjustFlipCardHeights);
          var header = document.getElementById("myHeader");
          var sticky = header.offsetTop;
          
          function myFunction() {
            if (window.pageYOffset > sticky) {
              header.classList.add("sticky");
            } else {
              header.classList.remove("sticky");
            }

            
          }
          function adjustFlipCardHeights() {
        document.querySelectorAll('.flip-card').forEach(function(card) {
        var front = card.querySelector('.flip-card-front');
        var back = card.querySelector('.flip-card-back');
        front.style.position = 'static';
        back.style.position = 'static';
        front.style.display = 'block';
        back.style.display = 'block';
        var maxHeight = Math.max(front.offsetHeight, back.offsetHeight);
        card.style.height = maxHeight + 'px';
        front.style.position = '';
        back.style.position = '';
        front.style.display = '';
        back.style.display = '';
      });
    }
          
   