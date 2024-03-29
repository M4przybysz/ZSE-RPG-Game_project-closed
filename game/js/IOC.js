function itemPickUp(x_mod, y_mod) {
    // Add item to player backpack
    Player.pickUpItem(Grid.items_map[Player.position_y + y_mod][Player.position_x + x_mod])

    // Item is in player backpack so it has no x and y values
    Active_save.Item_list[Grid.items_map[Player.position_y + y_mod][Player.position_x + x_mod]].x = null
    Active_save.Item_list[Grid.items_map[Player.position_y + y_mod][Player.position_x + x_mod]].y = null

    // Remove item from location and grid
    Active_save.Locations[Player.location].items.splice(Active_save.Locations[Player.location].items.indexOf(Grid.items_map[Player.position_y + y_mod][Player.position_x + x_mod]), 1)
    Grid.items_map[Player.position_y + y_mod][Player.position_x + x_mod] = null

    // Reload location
    Grid.importLocation(Player.location)
}

function itemDrop(item_id, drop_from_eq = false, eq_place = null) {
    if((Grid.items_map[Player.position_y][Player.position_x] === null && Player.backpack.includes(item_id)) || (Grid.items_map[Player.position_y][Player.position_x] === null && drop_from_eq == true && eq_place != null)) {
        if(drop_from_eq == true && eq_place != null) { Player.dropEqItem(eq_place) }
        else { Player.dropItem(item_id) }

        // Add item to location
        Grid.items_map[Player.position_y][Player.position_x] = item_id 
        if(Active_save.Locations[Player.location].items == null) Active_save.Locations[Player.location].items = []
        Active_save.Locations[Player.location].items.push(item_id)

        Active_save.Item_list[item_id].x = Player.position_x
        Active_save.Item_list[item_id].y = Player.position_y

        // Refresh location
        Grid.importLocation(Player.location)
    }
    else {
        console.log(`can't drop this item at this location`)
    }
}

function unsetAbilityEffect(effect_id, x, y) {
    // Remove effect from location and grid
    Active_save.Locations[Player.location].objects.splice(Active_save.Locations[Player.location].items.indexOf(Grid.objects_map[y][x], 1))
    Grid.objects_map[y][x] = null

    // Reload location
    Grid.importLocation(Player.location)
}

function setAbilityEffect(effect_id, x, y, a_num = null, x_multiplier = 1, y_multiplier = 1, x_add = 0, y_add = 0) {
    let d_mod = { // Direction modifier
        'W' : [0, -1],
        'S' : [0, 1],
        'A' : [-1, 0],
        'D' : [1, 0],
    }

    // Add effect to location
    Grid.objects_map[y + d_mod[Player.direction][1] * y_multiplier + y_add][x + d_mod[Player.direction][0] * x_multiplier + x_add] = effect_id
    if(Active_save.Locations[Player.location].objects == null) Active_save.Locations[Player.location].objects = []
    Active_save.Locations[Player.location].objects.push(effect_id)

    Active_save.MapObj_list[effect_id].x = x + d_mod[Player.direction][0] * x_multiplier + x_add
    Active_save.MapObj_list[effect_id].y = y + d_mod[Player.direction][1] * y_multiplier + y_add

    // Refresh location
    Grid.importLocation(Player.location)

    // Delete effect
    setTimeout(() => {
        unsetAbilityEffect(effect_id, x + d_mod[Player.direction][0] * x_multiplier + x_add, y + d_mod[Player.direction][1] * y_multiplier + y_add)
    }, 250)

    if(a_num != null) {
        ability_lock[a_num] = false
    }
}

function showItemInfo() {
    document.getElementById('info_container').style.display = 'block'
    document.getElementById('player_info_text').style.display = 'none'
    document.getElementById('item_info_text').style.display = 'block'
}

//================================================================================================================================
//================================================================================================================================
class Item {
    use() {}

    constructor(id, name, map_x, map_y, texture, usage = () => {console.log('Hello!!! I am an item!')}) {
        this.id = id
        this.name = name

        this.y = map_y
        this.x = map_x

        this.texture = texture

        this.use = usage
    }

    showInfo() {
        openMenuTab(4)
        document.getElementById('info_container').style.display = 'block'
        document.getElementById('player_info_text').style.display = 'none'

        let span = document.getElementById('item_info_text')
        span.style.display = 'block'
        
        span.innerHTML = `
            Item info: <br><br>
            Name: ${this.name} <br>
            ------------------------------- <br>
            Item type: ${this.constructor.name}`
    }
}

class Tool extends Item {
    constructor(id, name, map_x, map_y, texture, usage = () => {console.log('Hello!!! I am a tool!')}) {
        super(id, name, map_x, map_y, texture, usage)
    }
}

class Weapon extends Tool {
    constructor(id, name, map_x, map_y, texture, attack_power = 0, usage = () => {console.log('Hello!!! I am a weapon!')}, atack_type = 'melee', spell_cast_range = 0) {
        super(id, name, map_x, map_y, texture, usage)

        this.attack_power_value = attack_power
        this.atack_type = atack_type
        this.spell_cast_range = spell_cast_range
    }
}

class MeleeWeapon extends Weapon {
    constructor(id, name, map_x, map_y, texture, attack_power = 0, usage = () => {console.log('Hello!!! I am a melee weapon!')}) {
        super(id, name, map_x, map_y, texture, attack_power, usage, 'melee', 0)
    }
}

class MagicStaff extends Weapon {
    constructor(id, name, map_x, map_y, texture, attack_power = 0, usage = () => {console.log('Hello!!! AVADA KEDAVRAAA!!!')}, spell_cast_range = 3) {
        super(id, name, map_x, map_y, texture, attack_power, usage, 'magic', spell_cast_range)
    }
}

class Armor extends Item {
    constructor(id, name, map_x, map_y, texture, armor_place, def_value = 0) {
        super(id, name, map_x, map_y, texture, () => {console.log('Hello!!! I am on armor piece!')})

        this.armor_place = armor_place // head, torso, legs
        this.def_value = def_value // Numeric defense value
    }
}

class Consumable extends Item {
    constructor(id, name, map_x, map_y, texture, ) {
        super(id, name, map_x, map_y, texture, () => {console.log('Hello!!! I am a consumable item!')})
    }
}

class Healing extends Consumable {
    constructor(id, name, map_x, map_y, texture, healing_value = 0) {
        super(id, name, map_x, map_y, texture)

        this.healing_value = healing_value // How much item will heal the player
    }
}

class Food extends Consumable {
    constructor(id, name, map_x, map_y, texture, healing_value = 0, ) {
        super(id, name, map_x, map_y, texture, )

        this.healing_value = healing_value
    }
}

//================================================================================================================================
//================================================================================================================================
class MapObj {
    activateEffect() {}

    constructor(id, map_x, map_y, texture = null, effect = () => {}) {
        this.id = id

        this.y = map_y
        this.x = map_x

        this.texture = texture

        this.activateEffect = effect // Overwrite "activateEffect" method
    }
}

//================================================================================================================================
//================================================================================================================================
class Creature {
    constructor(id, name, map_x, map_y, texture, level, max_health, max_mana, attitude = 'neutral') {
        this.id = id
        this.name = name
        this.level = level
        this.attitude = attitude

        this.y = map_y
        this.x = map_x

        this.texture = texture

        this.max_health = max_health
        this.health = this.max_health

        this.max_mana = max_mana
        this.mana = max_mana
    }
}

class Person extends Creature {
    constructor(id, name, map_x, map_y, texture, level, max_health, max_mana, attitude = 'friendly') {
        super(id, name, map_x, map_y, texture, level, max_health, max_mana, attitude)
    }
}

class Animal extends Creature {
    constructor(id, name, map_x, map_y, texture, level, max_health, attitude = 'neutral') {
        super(id, name, map_x, map_y, texture, level, max_health, 0, attitude)
    }
}

class Monster extends Creature {
    constructor(id, name, map_x, map_y, texture, level, max_health, max_mana, attitude = 'hostile') {
        super(id, name, map_x, map_y, texture, level, max_health, max_mana, attitude)
    }
}

//================================================================================================================================
//================================================================================================================================
