function Common() {}
Common.roles = {
    PLAYER: 1,
    OBSTACLE: 2,
    DANGER: 3,
    ENEMY: 4,
    GOAL: 5,
    PASSIVE: 6,
    COLLECTIBLE: 7
};
Common.tileSize = {
    width: 18, // original: 22
    height: 30
};
Common.directions = {
    LEFT: -1,
    RIGHT: 1,
    NONE: 0
};
Common.reducedTileSize = {
    width: Common.tileSize.width - 5,
    height: Common.tileSize.height - 1
};
