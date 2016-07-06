const
MODE_TEXT = { // Сообщение для пользователя для каждого режима игры
  'playing': 'Ходит',
  'winner': 'Выиграл',
  'draw': 'Ничья'
};
const 
LINES = [ // заранее предопределенные варианты выигрыша
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[2, 0], [1, 1], [0, 2]]
];

var model = {
  root: null, // корневой элемент, контейнер для игрового поля и заголовка 
  mode: 'playing', // текущий режим приложения (playing|winner|draw)
  active: 'cross', // текущий игрок
  field: // состояние игрового поля
  [['empty', 'empty', 'empty'], ['empty', 'empty', 'empty'], ['empty', 'empty', 'empty']]
};

// $(document).ready(...) - очень близкий аналог window.onload
$(document).ready(function(){
  initGame('#game');
});

function initGame(root){
  model.root = $(root);
  reset(); // перед началом работы сбросить все на исходную
  model.root.find('.field').click(onCellClicked); // зарегистрировать обрабочик клика на игровое поле
}
/**
 * Обработчик события клика по игровому полю
 */
function onCellClicked(event){
  // поведение обработчика отличается во время игры и между раундами
  if(model.mode == 'playing'){
    var coords = getCellCoords(event); // куда конкретно кликнули?
    if(coords && model.field[coords[0]][coords[1]] == 'empty'){ //пуста ли ячейка?
      model.field[coords[0]][coords[1]] = model.active; // ставим туда фигуру текущего игрока
      var gameResult = checkGameResult(); // завершилась ли игра?
      switch (gameResult.mode) {
      case 'playing': // игра продолжается
        model.active = (model.active == 'cross' ? 'zero' : 'cross'); // ходит следующий игрок
        updateField();
        updateActivePlayer();
        break;
      case 'winner':
        model.mode = 'winner';
        updateField(gameResult.line);
        updateMessage();
        break;
      case 'draw':
        model.mode = 'draw'; 
        model.active = ''; // ничья - победившего нет
        updateField();
        updateMessage();
        updateActivePlayer();
      }
    }
    // если ячейка уже занята, то вообще ничего не делаем
  }else{
    // в данный момент игра завершена (или ничья, или есть победитель)
    // следующий клик начинает новую игру
    reset();
  }
}

/**
 * Возвращает координаты кликнутой ячейки
 * 
 * @param event
 *          событие клика
 * @return массив из двух значений [индексРяда, индексСтолбца] или undefined, если клик был не по ячейке
 */
function getCellCoords(event){
  var cell = $(event.target).closest('td'); // ближайший родитель
  if(cell)
    // извлекаем координаты из атрибутов и сразу же пакуем оба значения в массив
    return [+cell.attr('data-row'), +cell.attr('data-column')];
}

/**
 * Проверяет исход игры основываясь на текущем состоянии поля в модели
 * 
 * @return объект с полем mode, и (для выйгрыша) с полем line
 *      {
 *        mode : 'draw'|'winner'|'playing',
 *        line: [[индексРяда, индексСтолбца] x3]
 *      }
 */
function checkGameResult(){
  // 1. проверяем, есть ли выйгрыш
  for (var i = 0; i < LINES.length; ++i){
    var line = LINES[i]; // каждый вариант по отдельности
    var matches = true; // совпадает ли состояние линии с активным игроком
    // проверять на выйгрыш можно только активного игрока, т.к. только он может выиграть на этом ходу
    for (var j = 0; j < 3; ++j){
      var rowIndex = line[j][0];
      var columnIndex = line[j][1];
      matches = matches && model.field[rowIndex][columnIndex] == model.active;
    }
    if(matches)
      return {
        mode: 'winner',
        line: line
      };
  }
  // если есть хотя бы одна выйгрышная линия, то сюда программа не дойдет
  
  // 2. играем дальше, если еще остается куда ходить (есть хотя бы одна пустая ячейка)
  for (i = 0; i < 3; ++i)
    for (j = 0; j < 3; ++j)
      if(model.field[i][j] == 'empty')
        return {
          mode: 'playing'
        };

  // 3. нет победителя и некуда ходить - ничья
  return {
    mode: 'draw'
  };
}
/**
 * Сбрасывает состояние модели и поля на начальное
 */
function reset(){
  // сбрасываем все в модели кроме корневого элемента
  model.mode = 'playing';
  model.active = model.active || 'cross'; // первым в новой партии будет ходить выигравший
  for (var i = 0; i < 3; ++i)
    for (var j = 0; j < 3; ++j)
      model.field[i][j] = 'empty';
  // далее обновляем весь HTML
  updateField();
  updateMessage();
  updateActivePlayer();
}

/**
 * Приводит состояние игрового поля в соответствии с моделью. Расставляет все фигуры по ячейкам и при необходимости
 * выделяет выйгрышную линию
 * 
 * @param line
 *          необязательный параметр - выйгрышная линия
 */
function updateField(line){
  var fieldJQueryDescriptor = model.root.find('.field');
  var fieldHTMLElement = fieldJQueryDescriptor[0]; // так можно развернуть jQuery-дескриптор в обыкновенный HTML элемент
  for (var i = 0; i < 3; ++i)
    for (var j = 0; j < 3; ++j){
      var cell = $(fieldHTMLElement.rows[i].cells[j]);
      var state = model.field[i][j];
      cell.removeClass('zero cross empty winner').addClass(state);
    }
  if(line){ // если линия задана
    for (i = 0; i < 3; ++i){
      var rowIndex = line[i][0];
      var columnIndex = line[i][1];
      $(fieldHTMLElement.rows[rowIndex].cells[columnIndex]).addClass('winner');
    }
  }
}

/**
 * Обновляет сообщение в зависимости от режима игры
 */
function updateMessage(){
  model.root.find('.message').text(MODE_TEXT[model.mode]);
}
/**
 * Обновляет отображаемого активного игрока
 */
function updateActivePlayer(){
  model.root.find('.icon').removeClass('zero cross').addClass(model.active);
}
