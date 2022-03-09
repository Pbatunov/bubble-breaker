/* eslint-disable no-undef */
const rows = 6;
const columns = 6;
const circles = [];
let rowsDistanse = {};
const canvas = document.querySelector('canvas');
const canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;

let groupsCounter = 0;

const colors = [{
    base: '#ff4444',
    hover: '#ff7c7c',
    color: 'красный',

},
{
    base: '#8a00c9',
    hover: '#ad4dd9',
    color: 'пурпурный',
},
{
    base: '#ffeb3b',
    hover: '#fff176',
    color: 'желтый',
},
{
    base: '#3f51b5',
    hover: '#7985cb',
    color: 'синий',
},
{
    base: '#4caf50',
    hover: '#82c785',
    color: 'зеленый',
}];

const types = [
    0, 0, 1, 0, 0,
    0, 3, 3, 2, 1,
    3, 3, 2, 1, 2,
    0, 2, 1, 0, 1,
    0, 0, 1, 0, 0,

];

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const ctx = canvas.getContext('2d');

class Circle {
    constructor() {
        this.x = null;
        this.y = null;
        this.radius = (canvas.width / rows) / 2;
        this.fillColor = null;
        this.hoverColor = null;
        this.strokeColor = '#222';
        this.checked = false;
        this.text = '';

        this.draw = () => {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.fillColor;
            ctx.fill();
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.font = '30px serif';
            ctx.fillStyle = '#000';
            ctx.fillText(this.text, this.x, this.y);
            ctx.closePath();
        };
    }
}

const createCircles = () => {
    for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < columns; j += 1) {
            const circle = new Circle();
            const randomNumber = Math.floor(Math.random() * colors.length);

            // Проверка на первый и последний элементы в ряду
            if (j % columns === 0) {
                circle.firstInRow = true;
            } else if (j % columns === columns - 1) {
                circle.lastInRow = true;
            }

            circle.x = (2 * circle.radius) * j + circle.radius;
            circle.y = (2 * circle.radius) * i + circle.radius;
            circle.startPosition = circle.y;
            circle.fillColor = colors[randomNumber].base;
            circle.hoverColor = colors[randomNumber].hover;
            circle.type = randomNumber;
            circle.colorText = colors[randomNumber].color;
            circle.index = i * columns + j;
            circle.row = i;
            circle.column = j;

            circles.push(circle);
        }
    }
};

const makeGroups = () => {
    for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < columns; j += 1) {
            const circle = circles[i * columns + j];
            const nextElementInRow = circles[i * columns + j + 1];
            const prevElementInRow = circles[i * columns + j - 1];
            const nextElementInColumn = circles[(i + 1) * columns + j];

            // Тут формируем новые горизонтальные группы

            if (circle) {
                if (nextElementInRow && circle && !circle.lastInRow && nextElementInRow.type === circle.type
                && !circle.checked && !nextElementInRow.checked) {
                    circle.checked = true;
                    circle.group = groupsCounter;
                    circle.text = circle.group;
                    nextElementInRow.checked = true;
                    nextElementInRow.group = groupsCounter;
                    nextElementInRow.text = nextElementInRow.group;
                    groupsCounter += 1;

                // Тут добавляем элементы уже сформированные горизонтальные группы
                } else if (nextElementInRow && circle && !circle.lastInRow
                    && nextElementInRow.type === circle.type
                && circle.checked && !nextElementInRow.checked) {
                    nextElementInRow.checked = true;
                    nextElementInRow.group = circle.group;
                    nextElementInRow.text = nextElementInRow.group;
                }

                // Тут формируем новые вертикальные группы (текущий элемент + элемент из следующего снизу ряда)

                if (nextElementInColumn && circle && nextElementInColumn.type === circle.type
                && !circle.checked && !nextElementInColumn.checked) {
                    circle.checked = true;
                    circle.group = groupsCounter;
                    circle.text = circle.group;
                    nextElementInColumn.checked = true;
                    nextElementInColumn.group = circle.group;
                    nextElementInColumn.text = nextElementInColumn.group;
                    groupsCounter += 1;

                // Тут добавляем элементы в вертикальные группы
                } else if (nextElementInColumn && nextElementInColumn.type === circle.type && circle.checked) {
                    nextElementInColumn.checked = true;
                    nextElementInColumn.group = circle.group;
                    nextElementInColumn.text = nextElementInColumn.group;
                }

                // Тут смотрим, остался ли слева одиночный элемент не добавленный в группу и добавляем

                if (prevElementInRow && circle && !circle.firstInRow && prevElementInRow.type === circle.type && circle.checked
                && !prevElementInRow.checked && !prevElementInRow.group) {
                    prevElementInRow.group = circle.group;
                    prevElementInRow.checked = true;
                    prevElementInRow.text = prevElementInRow.group;
                }
            }
        }

        for (let k = 0; k < rows; k += 1) {
            for (let l = 0; l < columns; l += 1) {
                const circle = circles[k * columns + l];
                const prevElementInRow = circles[k * columns + l - 1];
                const prevElementInColumn = circles[(k - 1) * columns + l];

                // Тут сливаем горизонтальные группы, которые образуют общую группу

                if (circle && !circle.firstInRow && prevElementInColumn && prevElementInColumn.type === circle.type && circle.checked
                    && prevElementInRow && prevElementInRow.type === circle.type && prevElementInRow.checked
                    && prevElementInRow.group !== prevElementInColumn.group
                ) {
                    circle.group = prevElementInRow.group;
                    prevElementInColumn.group = circle.group;
                    circle.text = circle.group;
                    prevElementInColumn.text = prevElementInColumn.group;
                }
            }
        }
    }
};

const selectItem = (e) => {
    const coords = {
        x: e.offsetX,
        y: e.offsetY,
    };

    circles.forEach((item) => {
        if (item) {
            if (item.x - item.radius <= coords.x && item.x + item.radius >= coords.x
            && item.y - item.radius <= coords.y && item.y + item.radius >= coords.y) {
                rowsDistanse = {};

                for (let i = 0; i < circles.length; i += 1) {
                    const currentElement = circles[i];
                    const prevElementInColumn = circles[i - columns];

                    if (currentElement && currentElement.group !== undefined && currentElement.group === item.group) {
                        if (!rowsDistanse[currentElement.column]) {
                            rowsDistanse[currentElement.column] = {
                                row: currentElement.row,
                                distanse: (currentElement.radius * 2),
                            };
                        } else {
                            rowsDistanse[currentElement.column].distanse += (currentElement.radius * 2);
                        }

                        circles[i] = null;

                        if (prevElementInColumn) {
                            const currentTemp = circles[i];
                            const prevTemp = prevElementInColumn;
                            const prevY = prevElementInColumn.y;

                            console.log(prevY);

                            // circles[i] = prevElementInColumn;
                            // circles[i - columns] = currentTemp;
                        }
                    }
                }
            }
        }
    });
    console.log(rowsDistanse);

    // makeGroups();
};

const bindEvents = () => {
    canvas.addEventListener('click', selectItem);
};

const move = (element) => {
    if (element) {
        if (typeof rowsDistanse !== 'undefined' && rowsDistanse[element.column] && rowsDistanse[element.column].row > element.row) {
            if (element.y < element.startPosition + rowsDistanse[element.column].distanse) {
                element.y += 5;
            }
        } else {
            element.startPosition = element.y;
        }
    }
};
const render = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < circles.length; i += 1) {
        const circle = circles[i];

        if (circle) {
            move(circle);
            circle.draw();
        }
    }
};

const loop = () => {
    render();
    requestAnimationFrame(loop);
};

const init = () => {
    createCircles();
    makeGroups();
    bindEvents();
    loop();
};

init();
