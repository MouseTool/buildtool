--- BuildTool specific player
--- @class BtPlayer:EventEmitter
--- @field new fun(mbPlayer:MbPlayer, inRoom:boolean|nil):BtPlayer
--- @field on fun(eventName:'"languageChanged"', listener:fun()) # Fired when the player's language changes
---
--- @field name string # The player's A801 name
--- @field mbp MbPlayer # The MouseBase player object tied to the player
--- @field inRoom boolean # Whether the player is currently in the room
--- @field capabilities Capabilities # The player's capabiltiies
--- @field language string # The player's language
local BtPlayer = require("@mousetool/mousebase").EventEmitter:extend("BtPlayer")

local moduleMsgDirect = require("entities.bt_room").moduleMsgDirect
local Capabilities = require("permissions.Capabilities")
local btPerms = require("permissions.bt_perms")
local BT_ROLE = btPerms.ROLE
local BT_CAP = btPerms.CAPFLAG
local roomSets = require("settings.RoomSettings")
local localis = require("localisation.localis_manager")

local DEFAULT_LANGUAGE = "en"

local DEV = {["Cass11337#8417"] = true, ["Casserole#1798"] = true, ["Emeryaurora#0000"] = true}  -- TODO: tmp

--- @param mbPlayer MbPlayer # The MouseBase player object tied to the player
--- @param inRoom boolean|nil # Whether the player is in the room (default true)
BtPlayer._init = function(self, mbPlayer, inRoom)
    BtPlayer._parent._init(self)

    self.name = mbPlayer.name
    self.mbp = mbPlayer
    self.inRoom = inRoom or true
    self.capabilities = Capabilities:new()
    self.language = DEFAULT_LANGUAGE

    self.capabilities:addCaps(BT_ROLE.OWNER)  -- TODO: tmp test
    if DEV[self.name] then
        self.capabilities:addCaps(BT_ROLE.DEV)
    end
end

--- Sends a module message to the player.
--- @param messsge string  # The module message to display
BtPlayer.chatMsg = function(self, messsge)
    moduleMsgDirect(messsge, self.name)
end

--- Sends a translated module message to the player. If the `keyName` supplied is not found in the translations, the `keyName` will be displayed instead.
--- @param keyName string # The key name of the translation string
--- @vararg string[]|LocalisBuilder[] # Translation string parameters
BtPlayer.tlChatMsg = function(self, keyName, ...)
    moduleMsgDirect(self:tlGet(keyName, ...), self.name)
end

--- Sends a translated module message to the player. Similar to `tlChatMsg`, but accepts a localisation builder and caches the language string.
--- @see BtPlayer.tlChatMsg
--- @param locBuilder LocalisBuilder # The localisation builder
BtPlayer.tlbChatMsg = function(self, locBuilder)
    moduleMsgDirect(locBuilder:exec(self.language), self.name)
end

--- Retrives a translated module string for the player. If the `keyName` supplied is not found in the translations, the `keyName` will be displayed instead.
--- @param keyName string # The key name of the translation string
--- @vararg string[]|LocalisBuilder[] # Translation string parameters
--- @return string
BtPlayer.tlGet = function(self, keyName, ...)
    return localis.evaluator:new(keyName, ...):exec(self.language, false)
end

--- Sets the player's language
--- @param language? string # The language to set (default "en")
BtPlayer.setLanguage = function(self, language)
    self.language = language or DEFAULT_LANGUAGE
    self:emit('languageChanged')
end

--- Respawns the player with the standard conditions:
---  - Not banned
---  - Dead
---  - Auto-revive on
BtPlayer.normalRespawn = function(self)
    if self.capabilities:hasFlag(BT_CAP.BANNED) then return end
    if not self.mbp:getTfmPlayer().isDead then return end
    if roomSets:getBool('autorev') then
        tfm.exec.respawnPlayer(self.name)
    end
end

return BtPlayer
