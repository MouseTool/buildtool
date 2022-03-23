local DefaultComponent = require("componentOps").DefaultComponent

local exports = {}

-- TODO: Watch LLS [#449](https://github.com/sumneko/lua-language-server/issues/449)
-- Enhancement suggestion: mark function as class constructor #449

--- Implements an image component.
--- @class cookie-ui.ImageComponent : cookie-ui.IComponent
--- @field args any[]
--- @field imageId? integer
--- @field new fun(self: cookie-ui.ImageComponent, imageUid: integer, target?: string, xPosition: number, yPosition: number, xScale?: number, yScale?: number, angle?: number, alpha?: number, xAnchor?: number, yAnchor?: number)
local ImageComponent = DefaultComponent:extend("ImageComponent")
exports.ImageComponent = ImageComponent

function ImageComponent:_init(imageUid, target, xPosition, yPosition, xScale, yScale, angle, alpha, xAnchor, yAnchor)
    target = target or "~0"
    self.args = { imageUid, target, xPosition, yPosition, xScale, yScale, angle, alpha, xAnchor, yAnchor }
end

local function _addImage(playerName, imageUid, target, xPosition, yPosition, xScale, yScale, angle, alpha, xAnchor, yAnchor)
    return tfm.exec.addImage(imageUid, target, xPosition, yPosition, playerName, xScale, yScale, angle, alpha, xAnchor, yAnchor)
end

function ImageComponent:render()
    self.imageId = _addImage(self.wrapper.playerName, table.unpack(self.args, 1, 10))
end

function ImageComponent:destroy()
    tfm.exec.removeImage(self.imageId)
    self.imageId = nil
end

function ImageComponent:restore()
    tfm.exec.removeImage(self.imageId)
    self:render()
end

--- @class cookie-ui.TextAreaComponent : cookie-ui.IComponent
--- @field args any[]
--- @field textAreaId integer
--- @field new fun(self: cookie-ui.TextAreaComponent, textAreaId: number, text: string, x?: number, y?: number, width?: number, height?: number, backgroundColor?: number, borderColor?: number, backgroundAlpha?: number, fixedPos?: boolean)
local TextAreaComponent = DefaultComponent:extend("TextAreaComponent")
exports.TextAreaComponent = TextAreaComponent

function TextAreaComponent:_init(textAreaId, text, x, y, width, height, backgroundColor, borderColor, backgroundAlpha, fixedPos)
    self.args = { textAreaId, text, x, y, width, height, backgroundColor, borderColor, backgroundAlpha, fixedPos }
    self.textAreaId = textAreaId
end

local function _addTextArea(playerName, textAreaId, text, x, y, width, height, backgroundColor, borderColor, backgroundAlpha, fixedPos)
    ui.addTextArea(textAreaId, text, playerName, x, y, width, height, backgroundColor, borderColor, backgroundAlpha, fixedPos)
end

--- @param self cookie-ui.TextAreaComponent
--- @param text string # the new text to display
---@diagnostic disable-next-line: unused-function
local function _updateTextArea(self, textAreaId, text)
    ui.updateTextArea(self.textAreaId, text, self.wrapper.playerName)
    self.args[2] = text -- Update text
end

function TextAreaComponent:render()
    _addTextArea(self.wrapper.playerName, table.unpack(self.args, 1, 10))
end

function TextAreaComponent:destroy()
    ui.removeTextArea(self.textAreaId, self.wrapper.playerName)
end

function TextAreaComponent:unfocus()
    -- Remove text area
    self:destroy()
end

function TextAreaComponent:restore()
    self:destroy()
    self:render()
end

return exports
