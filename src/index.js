import StyleCss from './assets/scss/style.scss'; 

// import love from './assets/img/love.png';
import placeholder from './assets/img/placeholder.png';

function createBox() {
    var element = document.createElement('div');
    element.classList.add('box');
    element.innerHTML = [
        'Hello box!'
    ];
    return element;
}
  
document.body.appendChild(createBox());