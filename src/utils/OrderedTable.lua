-- Ordered table (dictionary) implementation
-- Preserves order in the insertion of keys when traversing through the table,
-- similar to JavaScript objects
--
-- Example usage:
-- ```
-- local myOdt = OrderedTable:new()
-- myOdt["One"] = true
-- myOdt["Two"] = true
-- myOdt["Three"] = true
-- myOdt["Two"] = true
-- for key, v  in OrderedTable.pairs(myOdt) do
--   print(key, v)
-- end
-- for key in OrderedTable.iterkeys(myOdt) do
--   print(key)
-- end
-- -- One
-- -- Two
-- -- Three
-- ```
--
-- The OrderedTable class exposes two different static methods to traverse
-- the table:
-- a. keys - returns a list of keys within the table, and a `length` property
--           within it to expose the number of keys
-- b. pairs - returns an key-value iterator for convenient looping similar to
--            pairs()
-- c. iterkeys - similar to pairs() but does not provide the value of the item
--
-- If you only need to manipulate the keys and not the item value, keys() and
-- iterkeys() will perform better than pairs() due to no indexing involved.

local OrderedTable = {}
do
    local nextOdt = function(tbl, index)
        local next_key
        if not index then
            -- First item
            local front = tbl._keys._front
            if not front then return nil end
            next_key = front._item
        else
            local node = tbl._keyNodes[index]
            if not node then return nil end
            local next_node = node._next
            if not next_node then return nil end
            next_key = next_node._item
        end
        return next_key, tbl._items[next_key]
    end
    local odtPairs = function(tbl)
        if not (tbl and tbl._keys) then
            error("Exepected table of type OrderedTable, got " .. type(tbl))
            return
        end
        return nextOdt, tbl, nil
    end

    local nextOdtKey = function(tbl, index)
        local next_key
        if not index then
            -- First item
            local front = tbl._keys._front
            if not front then return nil end
            next_key = front._item
        else
            local node = tbl._keyNodes[index]
            if not node then return nil end
            local next_node = node._next
            if not next_node then return nil end
            next_key = next_node._item
        end
        return next_key
    end

    local mt = {
        __newindex = function(tbl, index, val)
            if not tbl._items[index] then
                -- Add new key
                local keys = tbl._keys
                local node = {
                    _next = nil,
                    _prev = keys._back,
                    _item = index
                }
                if keys._back then
                    keys._back._next = node
                    keys._back = node
                end
                if not keys._front then
                    keys._front = node
                    keys._back = node
                end
                tbl._keyNodes[index] = node
                keys.length = keys.length + 1
            end
            if not val then
                -- Remove existing key
                local node = tbl._keyNodes[index]
                local keys = tbl._keys
                if node._prev then
                    node._prev._next = node._next
                else
                    -- This node is the front, set the front to the next
                    keys._front = node._next
                end
                if not node._next then
                    -- This node is the back, set the back to the prev
                    keys._back = node._prev
                end
                tbl._keyNodes[index] = nil
                keys.length = keys.length - 1
            end
            tbl._items[index] = val
        end,
        __index = function(tbl, index)
            return tbl._items[index]
        end,
        --__pairs = odtPairs
    }

    OrderedTable.pairs = odtPairs

    OrderedTable.keys = function(tbl)
        if not (tbl and tbl._keys) then
            error("Exepected table of type OrderedTable, got " .. type(tbl))
            return
        end
        local curr = tbl._keys._front
        local keys, klen = {}, 0
        while curr do
            klen = klen + 1
            keys[klen] = curr._item
            curr = curr._next
        end
        keys.length = klen
        return keys
    end

    OrderedTable.iterkeys = function(tbl)
        if not (tbl and tbl._keys) then
            error("Exepected table of type OrderedTable, got " .. type(tbl))
            return
        end
        return nextOdtKey, tbl, nil
    end

    OrderedTable.new = function(_)
        tbl = {}
        tbl._items = {}
        tbl._keys = { _front = nil, _back = nil, length = 0 }
        tbl._keyNodes = {}
        return setmetatable(tbl, mt)
    end
end

return OrderedTable
