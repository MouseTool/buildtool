local tfmcmd = require("commands.tfmcmd")
local cmdPerms = require("commands.perms")

local btRoom = require("entities.bt_room")
local globals = require("bt-vars")
local api = globals.api
local tfmEvent = api.tfmEvent

tfmcmd.setDefaultAllow(cmdPerms.IS_ADMIN)

require("commands.MapNp")

tfmEvent:on("ChatCommand", function(pn, msg)
    local ret, retmsg = tfmcmd.executeChatCommand(pn, msg)
	if ret ~= tfmcmd.OK then
		local default_msgs = {
			[tfmcmd.ENOCMD] = "no command found",
            [tfmcmd.EPERM] = "no permission",
            [tfmcmd.EMISSING] = "missing argument",
            [tfmcmd.EINVAL] = "invalid argument"
        }
        btRoom.moduleMsgDirect(retmsg or default_msgs[ret] or "", pn)
    end
    btRoom.moduleMsgDirect(("<G>[%s] !%s"):format(pn, msg))
end)
