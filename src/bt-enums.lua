local enums = {}

--- Window ID
--- @class WindowEnum
enums.Window = {
    HELP = 1,
    SETTINGS = 2,
}

--- Window overlay behavior - describes what the window should do when a
--- new window is layered over
--- @class WindowOverlayEnum
enums.WindowOverlay = {
    -- Mutually exclusive. Destroy the window.
    MUTUALLY_EXCLUSIVE = 0,
    -- Unfocus.
    UNFOCUS = 1,
}

return enums
