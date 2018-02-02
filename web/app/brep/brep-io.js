
export function toLoops(shell, presicion) {

  const fl = presicion || (v => v);
  
  const vertices = [];
  for (let v of shell.vertices) {
    vertices.push(v);
  }

  sortByXYZ(vertices);

  const verticesIndex = new Map();
  for (let i = 0; i < vertices.length; i++) {
    verticesIndex.set(vertices[i], i);
  }
 
  const faces = shell.faces.map(f => {
    const loops = [];
    for (let l of f.loops) {
      loops.push(l.halfEdges.map(e => verticesIndex.get(e.vertexA)));
    }
    return loops;
  });
  return {
    format: 'LOOPS',
    vertices: vertices.map(v => [fl(v.point.x), fl(v.point.y), fl(v.point.z)]),
    faces
  };
}

function sortByXYZ(vertices) {
  vertices.sort((v1, v2) => {
    let c = v1.point.x - v2.point.x;
    if (c === 0) {
      c = v1.point.y - v2.point.y;
      if (c === 0) {
        c = v1.point.z - v2.point.z;
      }
    }
    return c;
  });
}