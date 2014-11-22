function Parser() {
    this.levels = [];
    this.definitions = [];
    this.separator = '\nBEGINLEVEL';
    this.textRoles = {
        'player': Common.roles.PLAYER,
        'obstacle': Common.roles.OBSTACLE,
        'danger': Common.roles.DANGER,
        'goal': Common.roles.GOAL,
        'enemy': Common.roles.ENEMY,
        'collectible': Common.roles.COLLECTIBLE,
        'passive:': Common.roles.PASSIVE
    };
    this.defaultDefinitions = {
        S: 'player',
        g: 'obstacle',
        T: 'goal',
        '!': 'danger',
        E: 'enemy'
    };
    this.ignoredCharacters = [
        ' ',
        '\r',
        '\n',
        '\t'
    ];
    this.blockMode = true;

    this.makeObject = function(string, col, row, role, width, height) {
        return {
            string: string,
            role: role,
            position: {
                col: col,
                row: row
            },
            size: {
                width: width,
                height: height
            }
        };
    };

    this.containsIgnoredCharacters = function(str) {
        for(var i = 0; i < str.length; i++) {
            if(this.ignoredCharacters.indexOf(str[i].toString()) > -1)
                return true;
        }

        return false;
    };

    this.parse = function (str) {
        var split = str.split(this.separator);

        if(split.length < 2) {
            return;
        }

        this.parseDefinitions(split[0]);

        for(var i = 1; i < split.length; i++)
            this.parseLevel(split[i], this.definitions);
    };

    this.parseDefinitions = function (str) {
        this.definitions = JSON.parse(str);
        return this.definitions;
    };

    this.parseLevel = function (str, defs) {
        var lines = str.split('\n');
        var objects = [];
        var world = {
            width: 0,
            height: 0
        };

        for(var row = 0; row < lines.length; row++) {
            world.height = row;

            var line = lines[row];
            var expandedCol = 0;
            var currentBlock = {
                string: null,
                role: null,
                length: 0,
                start: 0,
                row: 0
            };

            for(var col = 0; col < line.length; col++) {
                var char = line[col].toString();

                // handle tab character as 4 spaces
                if(char == '\t')
                    expandedCol += 4;
                else
                    expandedCol += 1;

                // extend world width
                if(expandedCol > world.width)
                    world.width = expandedCol;

                // fallback to default defs if not found in user-defined
                var textRole = defs[char] ? defs[char].toLowerCase() : this.defaultDefinitions[char];

                // only assign a role if not an ignored character
                var role = null;
                if(!this.containsIgnoredCharacters(char))
                    role = this.textRoles[textRole] ? this.textRoles[textRole] : Common.roles.OBSTACLE;

                // old or new object mode?
                if(this.blockMode) {
                    // only make continuous block if obstacle
                    if(role == currentBlock.role && role == Common.roles.OBSTACLE) {
                        // same role, extend current block
                        currentBlock.length++;
                        currentBlock.string += char;
                    }
                    else {
                        // new role encountered, make the current block, but only if it has a role
                        if(currentBlock.length > 0 && currentBlock.role != null) {
                            var object = this.makeObject(currentBlock.string, currentBlock.start, currentBlock.row, currentBlock.role, currentBlock.length, 1);
                            objects.push(object);
                        }

                        // initialize current block to this symbol
                        currentBlock.string = char;
                        currentBlock.role = role;
                        currentBlock.length = 1;
                        currentBlock.start = expandedCol;
                        currentBlock.row = row;
                    }
                }
                else {
                    // old mode with equal sized blocks
                    if(!this.containsIgnoredCharacters(char)) {
                        var object = this.makeObject(char, expandedCol, row, role, 1, 1);
                        objects.push(object);
                    }
                }
            }

            // extra check for the last block on a line
            if(this.blockMode && currentBlock.length > 0 && currentBlock.role != null) {
                var object = this.makeObject(currentBlock.string, currentBlock.start, currentBlock.row, currentBlock.role, currentBlock.length, 1);
                objects.push(object);
            }
        }

        this.levels.push({
            world: world,
            objects: objects
        });
    };
}
