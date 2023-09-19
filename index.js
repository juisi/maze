// Boilerplate for the matter world
const { Engine, World, Runner, Bodies, Render, Body, Events } = Matter;
// global engine & world
const engine = Engine.create();
const { world } = engine;
// Game panel
const horizontalsInput = document.querySelector("#horizontalCols");
horizontalsInput.setAttribute("value", 8);
horizontalsInput.setAttribute("size", 1);

const verticalsInput = document.querySelector("#verticalRows");
verticalsInput.setAttribute("value", 8);
verticalsInput.setAttribute("size", 1);

const closeGamePanel = document.querySelector("#closeGameOptions");

//dimensional properties
let cellsHorizontal,
  cellsVertical,
  width,
  height,
  unitLengthX,
  unitLengthY,
  wallThickness,
  outerWallThickness;

const setMazeDimensions = () => {
  cellsHorizontal = Number.parseInt(horizontalsInput.value);
  cellsVertical = Number.parseInt(verticalsInput.value);
  width = window.innerWidth;
  height = window.innerHeight - 20;
  unitLengthX = width / cellsHorizontal;
  unitLengthY = height / cellsVertical;
  wallThickness = 5;
  outerWallThickness = 10;
};
setMazeDimensions();

//game properties
let goal, ball, ballRadius;
const setGameProperties = () => {
  goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX / 3,
    unitLengthY / 3,
    { isStatic: true, label: "gamegoal", render: { fillStyle: "green" } }
  );
  // use either which one is smallest as the ball radius
  ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
  ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    //isStatic: true,
    label: "gameball",
    render: {
      fillStyle: "blue",
    },
  });
};
setGameProperties();

// global render
const render = Render.create({
  engine: engine,
  element: document.body,
  options: { width: width, height: height, wireframes: false },
});
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

console.log(`cellsHorizontal: ${cellsHorizontal}`);
console.log(`cellsVertical: ${cellsVertical}`);
console.log(`unitLengthX: ${unitLengthX}`);
console.log(`unitLengthY: ${unitLengthY}`);

// Maze generator function
const generateMaze = () => {
  // disable gravity
  engine.world.gravity.y = 0;
  // outer walls
  const walls = [
    // rectangle parameters: X,Y,Width,height, options[]
    // X & Y coordinates from the center of the shape: 400px left from the rectangle center. Add 800 width: have the world width covered
    // Top center: X=400 & Y=0, add 40px height which leaves 20 px to each side of the top border
    Bodies.rectangle(width / 2, 0, width, outerWallThickness, {
      isStatic: true,
    }),
    //Bottom
    Bodies.rectangle(width / 2, height, width, outerWallThickness, {
      isStatic: true,
    }),
    //Left
    Bodies.rectangle(0, height / 2, outerWallThickness, height, {
      isStatic: true,
    }),
    //Right
    Bodies.rectangle(width, height / 2, outerWallThickness, height, {
      isStatic: true,
    }),
  ];
  World.add(world, walls);

  // Maze randomization
  const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
      // random index of the array
      const index = Math.floor(Math.random() * counter);
      // temp value at index -1 from the random index
      counter--;
      const temp = arr[counter];
      //set value at counter from the value at random index
      arr[counter] = arr[index];
      //overwrite the value at random index by the value with the temp value
      arr[index] = temp;
    }
    return arr;
  };

  // the messy way of filling a 2 dimensional array : nested for loops
  /*const grid = [];
  for (let i = 0; i < 3; i++) {
    grid.push([]);
    for (let j = 0; j < 3; j++) {
      grid[i].push(false);
    }
  }
  // Also problematic to just filling each with false straight away; modifying an element afterwards will affect multiple elements,
  // because each of the 3 inner arrays reference to the same memory allocation. aka, they are the same array
  // when pushing an element to [0], the push affects all of the 3 arrays.
  const grid2 = Array(3).fill([false, false, false]);
  grid2[0].push(true);
  console.log(grid2);
  */

  //  the clean and proper way of using fill() and map():
  //  first create an array with 3 cell, fill them with null and map the initial array (with null values) to return similar array with false values.
  //  This implementation guarantees that the inner arrays are individual elements that each have their distinct memory allocations..

  // outer grid array as the rows
  const grid = Array(cellsVertical)
    .fill(null)
    // map each outer array row as a new horizontal inner array: map will return the 2 dimensional grid where each element set as false
    .map(() => Array(cellsHorizontal).fill(false));

  // vertical walls  has y vertical rows (outer array) and x (inner array) columns in a y*x grid
  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

  // horizontal walls  has y vertical rows (outer array) and x columns (inner array) in a y*x grid : false value means there is a wall
  const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  // create random row and col indexes "coordinates"
  const startRow = Math.floor(Math.random() * cellsVertical);
  const startCol = Math.floor(Math.random() * cellsHorizontal);

  const stepThroughCell = (row, column) => {
    // if this cell at [row,column] has already been visited, do nothing but return from the function
    if (grid[row][column]) {
      return;
    }
    // mark this cell as visited : value=true
    //console.log(`step into grid cell at row:${row} column:${column} `);
    grid[row][column] = true;

    // assemble randomly ordered list of neighbor cells by
    // shuffling the fixed initial order
    const neighbors = shuffle([
      //above cell
      [row - 1, column, "up"],
      // right cell
      [row, column + 1, "right"],
      //below cell
      [row + 1, column, "down"],
      // left cell
      [row, column - 1, "left"],
    ]);

    // for each neighbor...
    for (let neighbor of neighbors) {
      const [nextRow, nextColumn, direction] = neighbor;
      //neighbor row or column index cannot ever be less than zero (maze grid starts at zero)
      //bigger or equal to cells means the column is out of grid bounds because valid column array index is allways -1 compared to number of cells in the grid
      if (
        nextRow < 0 ||
        nextRow >= cellsVertical ||
        nextColumn < 0 ||
        nextColumn >= cellsHorizontal
      ) {
        continue; // neigbor out of bounds -> continue with next neighbor
      }
      // if value true => we have visited that neighbor, continue to next neighbor
      if (grid[nextRow][nextColumn]) {
        continue;
      }
      // unvisited neighbor is inside bounds of the grid..

      // modify verticals array when moving left or right. The current row stays the same while the column changes
      if (direction === "left") {
        verticals[row][column - 1] = true;
      } else if (direction === "right") {
        verticals[row][column] = true;
      }
      // moving up or down : modify horizontals walls. The current column stays the same while the row changes
      else if (direction === "up") {
        horizontals[row - 1][column] = true;
      } else if (direction === "down") {
        horizontals[row][column] = true;
      }
      //visit that next cell by recursively calling oneself
      stepThroughCell(nextRow, nextColumn);
    }
  };
  // initial step into a cell at random row & col
  stepThroughCell(startRow, startCol);

  // iterate horizontal walls to decide where to draw the rectangle
  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, colIndex) => {
      if (open) {
        //true value represents a "no horizontal wall" : no drawing of cell wall here
        return; // should this be continue?
      } else {
        const wall = Bodies.rectangle(
          colIndex * unitLengthX + unitLengthX / 2, // center point of the rectangle X axis location. divide by 2 keeping central point at half the whole wall and so not overstepping x axis
          rowIndex * unitLengthY + unitLengthY, // calculate the center point of the rectangle Y location
          unitLengthX, // horizontal wall fills the whole cell unit
          wallThickness, // height of the horizontal wall distributed as 5px on both sides of the Y axis central point
          { isStatic: true, label: "mazewall", render: { fillStyle: "red" } }
        );
        World.add(world, wall);
      }
    });
  });

  // iterate vertical walls to decide where to draw the rectangle
  verticals.forEach((row, rowIndex) => {
    row.forEach((open, colIndex) => {
      if (open) {
        //true value represents a "no horizontal wall" : no drawing of cell wall here
        return; // should this be continue?
      } else {
        const wall = Bodies.rectangle(
          colIndex * unitLengthX + unitLengthX, // calculate the center point of the rectangle X axis location
          rowIndex * unitLengthY + unitLengthY / 2, // center point of the rectangle Y location. divide by 2 for keeping the central point at half of the whole wall length.
          wallThickness, // static width of the vertical wall distributed as 5px on both sides of the X axis central point
          unitLengthY, // vertical wall fills the whole cell unit
          { isStatic: true, label: "mazewall", render: { fillStyle: "red" } }
        );
        World.add(world, wall);
      }
    });
  });

  World.add(world, goal);
  World.add(world, ball);
};

closeGamePanel.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector(".gameOptions").classList.add("hidden");
});

const restartMaze = document.querySelector("#restartMaze");
restartMaze.addEventListener("click", (event) => {
  console.log("reset clicked");
  event.preventDefault();
  document.querySelector(".winner").classList.add("hidden");
  World.clear(world);
  cellsHorizontal = Number.parseInt(horizontalsInput.value);
  cellsVertical = Number.parseInt(verticalsInput.value);
  setMazeDimensions();
  setGameProperties();
  generateMaze();
});

// Keyboard event listener & Ball movement
document.addEventListener("keydown", (event) => {
  // destructure current velocity
  const { x, y } = ball.velocity;
  if (event.keyCode === 87) {
    // up
    Body.setVelocity(ball, { x, y: y - 5 }); // keep x axis movement as it is, subtract from y to move up
  } else if (event.keyCode === 68) {
    //right
    Body.setVelocity(ball, { x: x + 5, y }); // keep y axis movement as it is, add to x to move right
  } else if (event.keyCode === 83) {
    //down
    Body.setVelocity(ball, { x, y: y + 5 }); // keep x axis movement as it is, add to y to move down
  } else if (event.keyCode === 65) {
    //left
    Body.setVelocity(ball, { x: x - 5, y }); // keep y axis movement as it is, subtract from x to move left
  }
});

// win
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["gameball", "gamegoal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 0.5;
      world.bodies.forEach((body) => {
        if (body.label === "mazewall") {
          Body.setStatic(body, false);
        }
      });
      Body.setStatic(goal, false);
      document.querySelector(".gameOptions").classList.remove("hidden");
      document.querySelector(".winner").classList.remove("hidden");
    }
  });
});

// initial call to maze generator
generateMaze();
