import * as THREE from 'three';
import _defaults from 'lodash/defaults';
import _flatten from 'lodash/flatten';
import _groupBy from 'lodash/groupBy';
import _range from 'lodash/range';
import _values from 'lodash/values';
import _sum from 'lodash/sum';

const tubularSegments = 50
const radiusSegments = 8
const // 4,
    ballRadius = 0.2
const // 2.5,
    ballGeom = new THREE.SphereGeometry(ballRadius, 16, 8)

/**
 * Naive first stab at tapering the heads of hit tubes to points.
 * Modifies the first set of radius segment points on the tube curve by averaging their
 * coordinates to a common center point. Should be the same as the lead point in the
 * curve fed to THREE.TubeBufferGeometry.
 * Later, can generalize to more gradually taper by interpolating between joint center points and
 * joint radius segment points.
 * @param geom
 */
function taperTube(geom) {
    const buff = geom.attributes.position.array
    const coords = _values(_groupBy(buff, (coord, i) => Math.floor(i / 3)))
    const joints = _values(
        _groupBy(coords, (point, i) => Math.floor(i / (radiusSegments + 1)))
    )
    const firstJoint = joints[0]
    const xCoords = firstJoint.map((coord) => coord[0])
    const yCoords = firstJoint.map((coord) => coord[1])
    const zCoords = firstJoint.map((coord) => coord[2])
    const x = _sum(xCoords) / xCoords.length
    const y = _sum(yCoords) / yCoords.length
    const z = _sum(zCoords) / zCoords.length
    const newJoint = _flatten(_range(xCoords.length).map(() => [x, y, z]))

    newJoint.forEach((n, i) => {
        buff[i] = n
    })
}

class Hit extends THREE.Group {
    constructor(data, opts) {
        super(); // Call the parent constructor THREE.Group

        opts = _defaults(opts || {}, {
            color: 0xcccccc,
            ballColor: 0xf8f6e4,
            opacity: 0.1,
            drawTo: 0, // Infinity
        });

        /* trail */
        const pos = new Float32Array(data.path);
        const posLen = pos.length / 3;
        const arr = [];

        for (let i = 0; i < posLen; i++) {
            const v = pos.subarray(3 * i, 3 * i + 3);
            arr.push(new THREE.Vector3(v[0], v[1], v[2]));
        }

        const curve = new THREE.CatmullRomCurve3(arr);
        const radius = 0.2;
        const geom = new THREE.TubeGeometry(
            curve,
            tubularSegments,
            radius,
            radiusSegments,
            false
        )

        // isTransparent = opts.opacity < 1,
        const mat = new THREE.MeshPhongMaterial({
            color: opts.color,
            opacity: opts.opacity,
            transparent: true, // isTransparent,
            flatShading: THREE.SmoothShading, // THREE.FlatShading,
            shininess: 50,
            // side: isTransparent ? THREE.FrontSide: THREE.DoubleSide,
            side: THREE.FrontSide,
            depthWrite: true,
            // alphaTest: 0.5
        })

        taperTube(geom)

        const path = new THREE.Mesh(geom, mat)
        path.name = 'path'
        path.geometry.setDrawRange(0, opts.drawTo)
        // path.castShadow = true;
    
        this.add(path)
    
        /* ball */
        const ballMat = new THREE.MeshPhongMaterial({
            color: opts.ballColor,
            flatShading: THREE.SmoothShading, // THREE.FlatShading,
            shininess: 40,
            transparent: true, // false,
            // opacity: Math.min(2 * opts.color, 1),
            opacity: 0.8,
            depthWrite: true,
        })
        const ball = new THREE.Mesh(ballGeom, ballMat)
    
        ball.name = 'ball'
        ball.visible = false

        // TODOHI  need to position ball here?

        this.add(ball)

        // create state obj
        this.props = {
            defaultColor: new THREE.Color(opts.color),
            defaultOpacity: opts.opacity,
            defaultDrawTo: opts.drawTo,
        }

        this.state = {
            range: {
                in: 0,
                out: 0,
            },
            color: opts.color,
            drawTo: opts.drawTo,
            opacity: opts.opacity,
        }
    }
    // Instance methods (previously on Hit.prototype)
    show(from, to) {
        const path = this.getObjectByName('path');
        const pathGeom = path.geometry;
        const pathCurve = pathGeom.parameters.path;

        /* trail */
        const numSegments = Math.max(1, Math.floor(to * tubularSegments)); // Ensure at least 1 segment if to > 0
        const verticesToDraw = to === 0 ? 0 : numSegments * radiusSegments * 6;

        path.visible = to > 0;
        if (to > 0) {
            pathGeom.setDrawRange(0, verticesToDraw);
        }

        /* ball */
        const head = pathCurve.getPointAt(to);
        const ball = this.getObjectByName('ball');

        ball.visible = to > 0;
        ball.position.copy(head);

        // update state
        this.state.drawTo = to;
        this.state.range.in = from;
        this.state.range.out = to;
    }

    color(color, opacity) {
        this.state.opacity = opacity || this.state.opacity;
        this.state.color = color || this.state.color;

        const path = this.getObjectByName('path');
        path.material.color = new THREE.Color(this.state.color);
        path.material.opacity = this.state.opacity;

        const ball = this.getObjectByName('ball');
        ball.material.color = new THREE.Color(this.state.color);
        ball.material.opacity = Math.min(2 * this.state.opacity, 1);
    }

    resetColor() {
        const path = this.getObjectByName('path');
        path.material.color = this.props.defaultColor;
        path.material.opacity = this.props.defaultOpacity;

        const ball = this.getObjectByName('ball');
        ball.material.color = this.props.defaultColor; // Consider if ball should reset to its own default or the path's
        ball.material.opacity = Math.min(2 * this.props.defaultOpacity, 1);
    }

    // Static method (previously Hit.fromData)
    static fromData(play, opts) {
        const tracking = play.result.hit;
        const hit = new Hit(tracking, opts, play); // Use 'new Hit' now

        hit.name = play.id;
        hit.userData = play;

        return hit;
    }
}

export default Hit;