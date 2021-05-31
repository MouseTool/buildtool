local idGen = require("bt-ids")
local OrderedTable = require("@mousetool/ordered-table")
local WindowOverlayEnums = require("bt-enums").WindowOverlay

--- A basic window.
--- @class Window:EventEmitter
--- @field new fun(self:Window, pn:string, state:table):Window
--- @field public running boolean @Whether or not the window is running (false if not yet rendered/destroyed)
--- @field public focused boolean @Whether or not the window is focused
--- @field protected state table @Persistent state stored by WindowManager before the old instance was destroyed.
--- @field protected images OrderedTable
--- @field protected textAreas OrderedTable
--- @field protected pn string @The player whom the window belongs to
--- @field private _should_refocus_next boolean
--- @field private _cached_textAreas table
local Window = require("@mousetool/mousebase").EventEmitter:extend("Window")

Window.OVERLAY = WindowOverlayEnums.UNFOCUS

Window._init = function(self, pn, state)
    Window._parent._init(self)
    self.pn = pn

    -- Whether or not the window is running (false if not yet rendered/destroyed)
    self.running = false

    -- Whether or not the window is focused
    self.focused = false

    -- Persistent state stored by WindowManager before the old instance was
    -- destroyed.
    self.state = state or {}

    --- The following are arguments of window elements stored in order of
    --- insertion, used for recreation / refocus.
    -- Ordered dictionary of images added ([imageId] = {args...})
    self.images = OrderedTable:new()
    -- Ordered dictionary of text areas added ([textAreaId] = {args...})
    self.textAreas = OrderedTable:new()

end

--- Adds an image bound to the window.
--- @param imageUid string # the image identifier
--- @param target string # the game element to attach the image to
---     - #mobileId
---     - $playerName (on the mouse sprite)
---     - %playerName (with the mouse sprite removed)
---     - ?backgroundLayerDepth
---     - _groundLayerDepth
---     - !foregroundLayerDepth
---     - &fixedLayerDepthBeforeLuaInterfaces
---     - :fixedLayerDepthBehindLuaInterfaces
--- @param xPosition integer # the horizontal offset of the anchor of the image, relative to the game element (0 being the middle of the game element) (default 0)
--- @param yPosition integer # the vertical offset of the anchor of the image, relative to the game element (0 being the middle of the game element) (default 0)
--- @param xScale float # the horizontal (width) scale of the image (default 1)
--- @param yScale float # the vertical (height) scale of the image (default 1)
--- @param angle float # the rotation angle about anchor of the image, in radians (default 0)
--- @param alpha float # the opacity of the image, from 0 (transparent) to 1 (opaque) (default 1)
--- @param xAnchor float # the horizontal offset (in 0 to 1 scale) of the image's anchor, relative to the image (0 being the left of the image) (default 0)
--- @param yAnchor float # the vertical offset (in 0 to 1 scale) of the image's anchor, relative to the image (0 being the top of the image) (default 0)
--- @return integer # The image ID created from tfm.exec.addImage
Window.addImage = function(self, imageUid, target, xPosition, yPosition, xScale, yScale, angle, alpha, xAnchor, yAnchor)
    local imageId = tfm.exec.addImage(imageUid, target, xPosition, yPosition, self.pn, xScale, yScale, angle, alpha, xAnchor, yAnchor)
    self.images[imageId] = {imageUid, target, xPosition, yPosition, xScale, yScale, angle, alpha, xAnchor, yAnchor}
    return imageId
end

--- Removes an image bound to the window.
--- @param imageId integer the image identifier
Window.removeImage = function(self, imageId)
    tfm.exec.removeImage(imageId)
    self.images[imageId] = nil
end

--- Adds a text area bound to the window. If `nil` textAreaId, will use a generated ID.
--- @param textAreaId? integer # the identifier of the text area (if `nil`, generates a random ID)
--- @param text string # the text to display
--- @param x integer # the horizontal coordinate of the top-left corner (default 50)
--- @param y integer # the vertical coordinate of the top-left corner (default 50)
--- @param width integer # the width in pixels of the text area (if 0, it will be ajusted to the text width) (default 0)
--- @param height integer # the height in pixels of the text area (if 0, it will be ajusted to the text height) (default 0)
--- @param backgroundColor integer # the background color of the text area (default 0x324650)
--- @param borderColor integer # the border color of the text area (default 0)
--- @param backgroundAlpha float # the background's opacity, from 0 (transparent) to 1 (opaque) (default 1)
--- @param fixedPos boolean # whether the position is fixed or if it should follow the player's camera on long maps (default false)
--- @return integer # The ID of the text area created
Window.addTextArea = function(self, textAreaId, text, x, y, width, height, backgroundColor, borderColor, backgroundAlpha, fixedPos)
    textAreaId = textAreaId or idGen.getNewTextAreaId()
    ui.addTextArea(textAreaId, text, self.pn, x, y, width, height, backgroundColor, borderColor, backgroundAlpha, fixedPos)
    self.textAreas[textAreaId] = {textAreaId, text, x, y, width, height, backgroundColor, borderColor, backgroundAlpha, fixedPos}
    return textAreaId
end

--- Updates the content of a text area bound to the window.
--- @param textAreaId integer # the identifier of the text area
--- @param text string # the new text to display
--- @return boolean # Whether the text area was updated
Window.updateTextArea = function(self, textAreaId, text)
    if not self.textAreas[textAreaId] then return false end
    ui.updateTextArea(textAreaId, text, self.pn)
    self.textAreas[textAreaId][2] = text  -- Update text
    return true
end

--- Removes a text area bound to the window.
--- @param textAreaId integer # the identifier of the text area
Window.removeTextArea = function(self, textAreaId)
    ui.removeTextArea(textAreaId, self.pn)
    self.textAreas[textAreaId] = nil
end

--- Removes all text areas and images bound to the window.
Window.removeAllElements = function(self)
    -- Remove all images
    for img_id in OrderedTable.iterkeys(self.images) do
        tfm.exec.removeImage(img_id)
    end
    self.images = OrderedTable:new()

    -- Remove all text areas
    for ta_id in OrderedTable.iterkeys(self.textAreas) do
        ui.removeTextArea(ta_id, self.pn)
    end
    self.textAreas = OrderedTable:new()
end

--- Called on render before `rendered` event is emitted. 
--- @virtual
--- @protected
Window.doRender = function(self) end

--- Called on destroy before `destroyed` event is emitted. Default behavior is to call removeAllElements.
--- @virtual
--- @protected
Window.doDestroy = function(self)
    self:removeAllElements()
end

--- Draws the window. Emits `rendered` event.
Window.render = function(self)
    self:doRender()
    self.running = true
    self.focused = true
    self:emit("rendered")
end

--- Destroys the window. Emits `destroyed` event with the window's persistent state.
Window.destroy = function(self)
    self:doDestroy()
    self.destroyed = true
    self.running = nil
    self.focused = nil
    self:emit("destroyed", self.state)
end

--- Called on focus before `focused` event is emitted. Default behavior does nothing.
--- @virtual
Window.doFocus = function(self)
end

--- Called on unfocus before `unfocused` event is emitted. Default behavior is to remove all textareas, and stage them for readdition for the next focus() call.
--- @virtual
Window.doUnfocus = function(self)
    local cached_textArea, ctalen = {}, 0

    -- Cache and remove all text areas
    for ta_id, args in OrderedTable.pairs(self.textAreas) do
        ctalen = ctalen + 1
        cached_textArea[ctalen] = args
        ui.removeTextArea(ta_id, self.pn)
    end

    self._should_refocus_next = true
    cached_textArea.length = ctalen
    self._cached_textAreas = cached_textArea
    self.textAreas = OrderedTable:new()
end

--- Partially focus on the window. Restores all text areas if doUnfocus was not overloaded (default behavior). Subsequently calls doFocus.
--- Will emit the `focused` event when successfully transitioned from unfocused --> focused.
Window.focus = function(self)
    if self.focused then return end  -- already focused
    self:doFocus()

    -- Text area elements staged for readdition by doUnfocus()
    if self._should_refocus_next then
        for i = 1, self._cached_textAreas.length do
            self:addTextArea(table.unpack(self._cached_textAreas[i], 1, 10))
        end
        self._should_refocus_next = nil
        self._cached_textAreas = nil
    end

    self.focused = true
    self:emit("focused")
end

--- Unfocus the window. Calls doUnfocus().
--- Will emit the `unfocused` event when successfully transitioned from focused --> unfocused.
Window.unfocus = function(self)
    if not self.focused then return end  -- already unfocused
    self:doUnfocus()
    self.focused = false
    self:emit("unfocused")
end

--- Re-focus the window. Similar to focus(), except that it also readds all images.
--- The difference with focus() is that this is mostly used when the unfocused window needs to be re-rendered over other windows. 
--- Will emit both `focused` and `refocused` events when successfully transitioned from unfocused --> focused.
Window.refocus = function(self)
    if self.focused then return end  -- already focused
    self:doFocus()

    -- Readd all existing images.
    local cached_images, ci_len = {}, 0
    for img_id, args in OrderedTable.pairs(self.images) do
        ci_len = ci_len + 1
        cached_images[ci_len] = args
        tfm.exec.removeImage(img_id)
    end
    self.images = OrderedTable:new()

    for i = 1, ci_len do
        self:addImage(table.unpack(cached_images[i], 1, 10))
    end

    -- Text area elements staged for readdition by doUnfocus()
    if self._should_refocus_next then
        for i = 1, self._cached_textAreas.length do
            self:addTextArea(table.unpack(self._cached_textAreas[i], 1, 10))
        end
        self._should_refocus_next = nil
        self._cached_textAreas = nil
    end

    self.focused = true
    self:emit("focused")
    self:emit("refocused")
end
return Window
