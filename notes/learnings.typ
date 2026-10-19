#import "template.typ": *

#show: notes.with(
  project: "Portfolio Website",
  topic: "Learning Notes",
  author: "Oliver Larsson",
  language: "TypeScript",
)


= Monday, October 19: From Scratch

/ ref: per-instance member variable, stored by React rather than by you, which React promises not to re-render over when you write to it.
- React is pull and event driven, while the render loop continuously reads and renders. Therfore, there is no setter function needed.

/ prop: short for property, the way we pass configuration from the parent to the child
- Interface typeannotation
- `{}` destructuring
- optionals

/ tuple types: R3F requires exact quantity of members for certain jsx elements

```
  const exact: [number, number, number] = [3, 4, 5];
  <directionalLight position={exact} />
```





#stamp()
