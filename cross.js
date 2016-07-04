// window.onload = startClock;
// function startClock (){
// }
// function drawClock (){

// }
// function drawMacks (){
// 	var R = 45;
// 	var container = document.querySelectorAll('.watch .marks')[0];
// 	for (var angle = 60, i = 1; i <= 12; i++, angle -=30){
// 		var radAngle = Math.PI * angle / 180;
// 		var x = 50 + R * Math.cos(radAngle);
// 		var y = 50 - R * Math.sin(radAngle);
// 		var li = document.createElement('li');
// 		li.textContent = i;
// 		li.style.left = x + '%';
// 		li.style.top = y + '%';
// 		container.appendChild(li);
// 	}
// }
// function drawTicks(container){
//   for (var i = 0; i < 60; ++i){
//     var angle = i * 6;
//     var li = document.createElement('li');
//     li.style.transform = 'rotate(' + angle + 'deg)';
//     if(i % 5 == 0)
//       li.className = 'thick';
//     container.appendChild(li);
//   }
// }
// function smoothRotation(date){
//   var seconds = date.getSeconds() + date.getMilliseconds() / 1000;
//   var minutes = date.getMinutes() + seconds / 60;
//   var hours = date.getHours() % 12 + minutes / 60;
//   return {
//     hours: ratioToDegrees(hours / 12),
//     minutes: ratioToDegrees(minutes / 60),
//     seconds: ratioToDegrees(seconds / 60)
//   }
// }
// function ratioToDegrees(ratio){
//   return (ratio * 360 - 90);
// }
function startClock(){
  var watches = document.querySelectorAll('.watch');
  for (var i = 0; i < watches.length; ++i){
    var watch = watches[i];
    drawMarks(watch.querySelector('.marks'));
    drawTicks(watch.querySelector('.ticks'));
  }

  requestAnimationFrame(function drawer(){ //именованное функциональное выражение - для рекурсии
    updateHands();
    requestAnimationFrame(drawer); //рекурсия
  });
}
/**
 * Создает циферблат
 * 
 * @param container
 *          родительский элемент для создаваемых цифр
 */
function drawMarks(container){
  var R = 41;
  for (var i = 1, angle = 60; i <= 12; ++i, angle -= 30){
    var angleRad = angle * Math.PI / 180;
    var x = 50 + R * Math.cos(angleRad);
    var y = 50 - R * Math.sin(angleRad);
    var li = document.createElement('li');
    li.textContent = i;
    li.style.left = x.toFixed(2) + "%"; // округляем до 2 знаков в дробной части
    li.style.top = y.toFixed(2) + "%";
    container.appendChild(li);
  }
}
/**
 * Создает поминутные и пятиминутные отметки на циферблате
 * 
 * @param container
 *          родительский элемент для создаваемых засечек на циферблате
 */
function drawTicks(container){
  for (var i = 0; i < 60; ++i){ //всего 60 делений
    var angle = i * 6; // по 6 градусов на каждое деление
    var li = document.createElement('li');
    li.style.transform = 'rotate(' + angle + 'deg)';
    if(i % 5 == 0) // каждое пятое деление - толстое
      li.className = 'thick';
    container.appendChild(li);
  }
}
/**
 * Обновляет положение стрелок всех часов в документе
 */
function updateHands(){
  var computeRotation = jerkyRotation;
  // использование матрицы позволяет добавить плавный управляемый переход между состояниями с помощью CSS
  var applyRotation = matrixTransform;
  var rotation = computeRotation(new Date());
  var watches = document.querySelectorAll('.watch');
  for (var i = 0; i < watches.length; ++i){
    applyRotation(watches[i].querySelector('.hourHand'), rotation.hours);
    applyRotation(watches[i].querySelector('.minuteHand'), rotation.minutes);
    applyRotation(watches[i].querySelector('.secondHand'), rotation.seconds);
  }
}
/**
 * Вспомогательная функция для вычисления желаемого угла поворота изначально горизонтальной стрелки исходя из доли
 * пройденного ею пути по окружности
 * 
 * @param ratio
 *          доля пройденного стрелкой пути по отношению ко всей окружности (значение из интервала [0..1))
 * @return угол поворота в системе отсчета документа (значение из интервала [0..360))
 */
function ratioToDegrees(ratio){
  return (ratio * 360 - 90) % 360;
}

//---- способы задания поворота
function rotateTransform(hand, degrees){ // просто поворот, имеет проблемы с анимацией
  hand.style.transform = 'rotate(' + degrees.toFixed(2) + 'deg)';
}

function matrixTransform(hand, degrees){ //полная матрица трансформации, анимируется без ошибок
  var a = degrees * Math.PI / 180;
  var cos = Math.cos(a);
  var sin = Math.sin(a);
  var matrixArgs = [cos, sin, -sin, cos, 0, 0];
  hand.style.transform = 'matrix(' + matrixArgs.join(',') + ')';
}

//---- способы вычисления поворота
function smoothRotation(date){ // стрелки плавно передвигаются между засечками
  var seconds = date.getSeconds() + date.getMilliseconds() / 1000;
  var minutes = date.getMinutes() + seconds / 60;
  var hours = date.getHours() % 12 + minutes / 60;
  return {
    hours: ratioToDegrees(hours / 12),
    minutes: ratioToDegrees(minutes / 60),
    seconds: ratioToDegrees(seconds / 60)
  }
}

// function jerkyRotation(date){ // стрелки занимают дискретные положения, точно по засечкам
//   return {
//     hours: ratioToDegrees(date.getHours() % 12 / 12),
//     minutes: ratioToDegrees(date.getMinutes() / 60),
//     seconds: ratioToDegrees(date.getSeconds() / 60)
//   }
// }

window.onload = startClock;