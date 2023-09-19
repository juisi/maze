console.log("run index.js");
// Boilerplate for the matter world
const { Engine, World, Runner, Bodies, Render, MouseConstraint, Mouse } =
  Matter;
const engine = Engine.create();
const { world } = engine;

const width = 800;
const height = 600;
const render = Render.create({
  engine: engine,
  element: document.body,
  options: { width: width, height: height, wireframes: false },
});
Render.run(render);
Runner.run(Runner.create(), engine);
World.add(
  world,
  MouseConstraint.create(engine, { mouse: Mouse.create(render.canvas) })
);

const walls = [
  // rectangle parameters: X,Y,Width,height, options[]
  // X & Y coordinates from the center of the shape: 400px left from the rectangle center. Add 800 width: have the world width covered
  // Top center: X=400 & Y=0, add 40px height which leaves 20 px to each side of the top border
  Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
  //Bottom
  Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
  //Left
  Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
  //Right
  Bodies.rectangle(800, 300, 40, 600, { isStatic: true }),
];
World.add(world, walls);
for (let i = 0; i < 20; i++) {
  if (Math.random() > 0.5) {
    World.add(
      world,
      //Bodies.rectangle(width / i + 1, height / i + 1, 50 - i, 50 + i, {
      Bodies.rectangle(
        width * Math.random(),
        height * Math.random(),
        50 - i,
        50 + i,
        {
          isStatic: false,
        }
      )
    );
  } else {
    World.add(
      world,
      Bodies.circle(
        width * Math.random(),
        height * Math.random(),
        // radius
        30 - i,
        {
          render: { fillStyle: "red" },
          isStatic: false, // default as false
        }
      )
    );
  }
}
