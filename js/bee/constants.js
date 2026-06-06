/* ============================================================
   BEE STATE
   ============================================================ */
const GRID_SIZE = 8;
const CENTER_CELL = Math.floor((GRID_SIZE - 1) / 2); // 3 em tabuleiro 8×8
const FREE_PLAY_START = { x: CENTER_CELL, y: CENTER_CELL, dir: 'NORTH' };

const DIRECTIONS = ['NORTH','EAST','SOUTH','WEST'];
//const DIR_ROTATION = { NORTH: -90, EAST: 0, SOUTH: 90, WEST: 180 };
const DIR_ROTATION = { NORTH: 0, EAST: 90, SOUTH: 180, WEST: -90 };
const DIR_DELTA = {
    NORTH: {dx:0,dy:-1},
    EAST:  {dx:1,dy:0},
    SOUTH: {dx:0,dy:1},
    WEST:  {dx:-1,dy:0}
};
const OPPOSITE = { NORTH:'SOUTH', SOUTH:'NORTH', EAST:'WEST', WEST:'EAST' };
