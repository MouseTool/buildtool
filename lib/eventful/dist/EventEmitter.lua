local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ArrayUnshift = ____lualib.__TS__ArrayUnshift
local ____exports = {}
local EventEmitter = __TS__Class()
EventEmitter.name = "EventEmitter"
function EventEmitter.prototype.____constructor(self)
    self.eventListenersArray = {}
end
function EventEmitter.prototype.addListener(self, eventName, listener)
    return self:on(eventName, listener)
end
function EventEmitter.prototype.on(self, eventName, listener)
    local events = self.eventListenersArray
    if not events[eventName] then
        events[eventName] = {count = 0, listeners = {}}
    end
    local event = events[eventName]
    local ____event_listeners_1 = event.listeners
    local ____event_count_0 = event.count + 1
    event.count = ____event_count_0
    ____event_listeners_1[____event_count_0] = listener
    if event.count - (self.maxListeners or EventEmitter.defaultMaxListeners) == 1 then
        print(((("MaxListenersExceededWarning: Possible EventEmitter memory leak detected. " .. tostring(event.count)) .. " ") .. tostring(eventName)) .. " listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit")
    end
    return self
end
function EventEmitter.prototype.once(self, eventName, listener)
    local onceListener
    onceListener = function(...)
        listener(...)
        self:removeListener(eventName, onceListener)
    end
    return self:on(eventName, onceListener)
end
function EventEmitter.prototype.removeListener(self, eventName, listener)
    local event = self.eventListenersArray[eventName]
    if not event then
        return self
    end
    do
        local i = event.count - 1
        while i >= 0 do
            if event.listeners[i + 1] == listener then
                table.remove(event.listeners, i + 1)
                event.count = event.count - 1
                if event.count == 0 then
                    self.eventListenersArray[eventName] = nil
                end
                return self
            end
            i = i - 1
        end
    end
    return self
end
function EventEmitter.prototype.off(self, eventName, listener)
    return self:removeListener(eventName, listener)
end
function EventEmitter.prototype.removeAllListeners(self, eventName)
    if not eventName then
        for n in pairs(self.eventListenersArray) do
            self.eventListenersArray[n] = nil
        end
    else
        self.eventListenersArray[eventName] = nil
    end
    return self
end
function EventEmitter.prototype.setMaxListeners(self, n)
    self.maxListeners = n
    return self
end
function EventEmitter.prototype.getMaxListeners(self)
    return self.maxListeners or EventEmitter.defaultMaxListeners
end
function EventEmitter.prototype.emit(self, eventName, ...)
    local event = self.eventListenersArray[eventName]
    if not event then
        return false
    end
    local toEmit = {table.unpack(event.listeners, 1, event.count)}
    for ____, listener in ipairs(toEmit) do
        listener(...)
    end
    return true
end
function EventEmitter.prototype.listenerCount(self, eventName)
    local ____table_eventListenersArray_eventName_count_2 = self.eventListenersArray[eventName]
    if ____table_eventListenersArray_eventName_count_2 ~= nil then
        ____table_eventListenersArray_eventName_count_2 = ____table_eventListenersArray_eventName_count_2.count
    end
    return ____table_eventListenersArray_eventName_count_2 or 0
end
function EventEmitter.prototype.prependListener(self, eventName, listener)
    local events = self.eventListenersArray
    if not events[eventName] then
        events[eventName] = {count = 0, listeners = {}}
    end
    local event = events[eventName]
    event.count = event.count + 1
    __TS__ArrayUnshift(event.listeners, listener)
    if event.count - (self.maxListeners or EventEmitter.defaultMaxListeners) == 1 then
        print(((("MaxListenersExceededWarning: Possible EventEmitter memory leak detected. " .. tostring(event.count)) .. " ") .. tostring(eventName)) .. " listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit")
    end
    return self
end
function EventEmitter.prototype.prependOnceListener(self, eventName, listener)
    local onceListener
    onceListener = function(...)
        listener(...)
        self:removeListener(eventName, onceListener)
    end
    return self:prependListener(eventName, onceListener)
end
function EventEmitter.prototype.eventNames(self)
    local names = {}
    for n in pairs(self.eventListenersArray) do
        names[#names + 1] = n
    end
    return names
end
EventEmitter.defaultMaxListeners = 20
____exports.EventEmitter = EventEmitter
return ____exports
