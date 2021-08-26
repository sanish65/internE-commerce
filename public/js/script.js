// Mobile nav
$(document).ready(() => {
  $('.navbar-toggler, .nav-button').on('click', () => {
    $('.mobile-menu, .overlay').toggleClass('open');
  });

  $('.nav-button').click(() => {
    $('.nav-button').toggleClass('change');
  });
});

// Navigation bar
$(() => {
  const current = window.location.pathname;
  $('#navbar ul li a').each(() => {
    const $this = $(this);

    // we check comparison between current page and attribute redirection.
    if ($this.attr('href') === current) {
      $this.addClass('nav-active');
    }
  });
});

// Toggle sidebar on Menu button click
$('#sidebarCollapse').on('click', () => {
  $('#sidebar').toggleClass('active');
  $('#body').toggleClass('active');
});

// SCroll top
$(document).ready(() => {
  $('.scrollTop').fadeOut();
  // show hide button on scroll
  $(window).scroll(() => {
    if ($(this).scrollTop() > 200) {
      $('.scrollTop').fadeIn();
    } else {
      $('.scrollTop').fadeOut();
    }
  });
  // smooth scrolling
  $('.scrollTop').click(() => {
    $('html, body').animate({ scrollTop: 0 }, 2000);
  });

  $('#button1').click(() => {
    $('html, body').animate({ scrollTop: $('#about').offset().top }, 2000);
  });
});
